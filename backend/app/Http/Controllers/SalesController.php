<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sale;
use App\Models\Menu;
use App\Models\Ingredient;
use App\Models\MenuIngredient;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class SalesController extends Controller
{
    public function upload(Request $request)
    {
        // 1. Validasi file
        $request->validate([
            'file' => 'required|file',
        ]);

        $file = $request->file('file');
        $filePath = $file->getRealPath();

        // 2. Buka file dan baca isinya
        $fileHandle = fopen($filePath, 'r');
        fgetcsv($fileHandle); // Melewati baris pertama (header)

        $dataToInsert = [];

        // 3. Looping isi CSV baris demi baris
        while (($row = fgetcsv($fileHandle)) !== false) {
            $dataToInsert[] = [
                'transaction_date' => $row[0], 
                'menu_name'        => $row[1], 
                'quantity_sold'    => $row[2], 
                'created_at'       => now(),
                'updated_at'       => now(),
            ];
        }
        fclose($fileHandle);

        // 4. Simpan ke database (Bulk Insert)
        Sale::insert($dataToInsert);

        return response()->json([
            'status' => 'success',
            'message' => count($dataToInsert) . ' data penjualan berhasil disimpan!'
        ]);
    }

    public function analyze()
    {
        // 1. Rekap Data Penjualan dari PostgreSQL
        $salesSummary = Sale::select('menu_name', DB::raw('SUM(quantity_sold) as total_sold'))
            ->groupBy('menu_name')
            ->get();

        if ($salesSummary->isEmpty()) {
            return response()->json(['error' => 'Belum ada data penjualan untuk dianalisa.'], 400);
        }

        // 2. Siapkan Teks Data untuk AI
        $promptData = "";
        foreach ($salesSummary as $item) {
            $promptData .= "- {$item->menu_name}: terjual {$item->total_sold} porsi\n";
        }

        // 3. Susun Prompt 
        $prompt = "Kamu adalah analis bisnis F&B. Berikut data total penjualan bulan ini:\n" . 
                  $promptData . 
                  "\nBerikan prediksi tren penjualan bulan depan (naik/turun dalam persentase) untuk setiap menu berdasarkan naluri bisnis F&B. " .
                  "KEMBALIKAN HANYA FORMAT JSON MURNI TANPA TEKS PEMBUKA/PENUTUP. " .
                  "Format JSON: [{\"item\": \"nama menu\", \"trend_percentage\": 20}]";

        // 4. Pengecekan API Key
        $apiKey = env('GROQ_API_KEY');
        if (empty($apiKey)) {
            return response()->json(['error' => 'GROQ_API_KEY belum diisi di file .env'], 500);
        }

        // 5. Tembak ke API Groq
        $response = Http::withToken($apiKey)->post('https://api.groq.com/openai/v1/chat/completions', [
            'model' => 'llama-3.3-70b-versatile',
            'messages' => [
                ['role' => 'user', 'content' => $prompt]
            ],
            'temperature' => 0.2 // Dibuat rendah agar akurat
        ]);

        $result = $response->json();

        // 6. Tangkap Error dari Groq (Misal kuota habis)
        if (isset($result['error'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Groq API Error: ' . $result['error']['message']
            ], 500);
        }

        $aiContent = $result['choices'][0]['message']['content'] ?? null;
        if (!$aiContent) {
            return response()->json([
                'status' => 'error',
                'message' => 'Respons AI kosong atau tidak terduga',
                'raw_result' => $result
            ], 500);
        }

        // 7. Bersihkan Respons JSON dari AI secara paksa menggunakan Regex
        preg_match('/\[.*\]/s', $aiContent, $matches);
        $cleanJson = $matches[0] ?? '[]';
        $predictions = json_decode($cleanJson, true);

        if ($predictions === null) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membaca JSON dari AI.',
                'ai_raw_text' => $aiContent
            ], 500);
        }

        // 8. Kalkulasi Kebutuhan Bahan Baku (Backend Logic)
        $restockList = [];
        $ingredientNeeds = [];

        foreach ($predictions as $prediction) {
            $menuName = $prediction['item'] ?? '';
            $trendPct = $prediction['trend_percentage'] ?? 0;

            // Cari total penjualan bulan ini
            $currentSales = Sale::where('menu_name', $menuName)->sum('quantity_sold');
            
            // Hitung target penjualan bulan depan
            $predictedSales = ceil($currentSales * (1 + ($trendPct / 100)));

            // Cari resep untuk menu ini
            $menu = Menu::where('name', $menuName)->first();
            
            if ($menu) {
                $recipes = MenuIngredient::where('menu_id', $menu->id)->get();
                
                foreach ($recipes as $recipe) {
                    $ingId = $recipe->ingredient_id;
                    $needed = $predictedSales * $recipe->quantity_needed;
                    
                    if (!isset($ingredientNeeds[$ingId])) {
                        $ingredientNeeds[$ingId] = 0;
                    }
                    $ingredientNeeds[$ingId] += $needed;
                }
            }
        }

        // 9. Bandingkan Kebutuhan vs Stok Gudang Saat Ini
        foreach ($ingredientNeeds as $ingId => $totalNeeded) {
            $ingredient = Ingredient::find($ingId);
            
            if ($ingredient) {
                // Tambahkan safety buffer 20% agar aman
                $totalNeededWithBuffer = ceil($totalNeeded * 1.2);
                $shortage = $totalNeededWithBuffer - $ingredient->current_stock;

                // Jika stok gudang kurang, masukkan ke daftar belanja
                if ($shortage > 0) {
                    $restockList[] = [
                        'ingredient_name' => $ingredient->name,
                        'unit' => $ingredient->unit,
                        'current_stock' => $ingredient->current_stock,
                        'needed_stock' => $totalNeededWithBuffer,
                        'order_amount' => $shortage,
                        'status' => $shortage > ($ingredient->current_stock * 0.5) ? 'critical' : 'low'
                    ];
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'ai_predictions' => $predictions,
            'restock_recommendations' => $restockList
        ]);
    }
}