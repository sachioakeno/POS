<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ingredient;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon; 

class AnalyticsController extends Controller
{
    public function getDashboardData()
    {

        $totalRevenue = Order::sum('total_price') ?? 0;
        $totalHpp = OrderItem::sum(DB::raw('quantity * hpp_at_time')) ?? 0; 

        // 1. Hitung Key Performance Indicators (KPI)
        $kpis = [
            'gross_revenue' => $totalRevenue,
            'net_profit' => $totalRevenue - $totalHpp,
            'transactions' => Order::count(),
            'items_sold' => OrderItem::sum('quantity') ?? 0,
            'low_stock' => Ingredient::where('current_stock', '<', 500)->count(),
        ];

        // 2. Hitung Tren Pendapatan 7 Hari Terakhir (Aman untuk PostgreSQL)
        $trendData = Order::select(
            DB::raw('DATE(created_at) as raw_date'),
            DB::raw('SUM(total_price) as revenue')
        )
        ->groupBy('raw_date')
        ->orderBy('raw_date', 'asc')
        ->limit(7)
        ->get();

        // Format tanggalnya menggunakan PHP (Carbon) agar bebas error
        $revenueTrend = $trendData->map(function ($item) {
            return [
                'date' => Carbon::parse($item->raw_date)->format('d M'),
                'revenue' => $item->revenue
            ];
        });

        // 3. Cari 5 Menu Paling Laris (Top Products)
        $topProducts = OrderItem::join('menus', 'order_items.menu_id', '=', 'menus.id')
            ->select('menus.name', DB::raw('SUM(order_items.quantity) as sold'))
            ->groupBy('menus.id', 'menus.name')
            ->orderByDesc('sold')
            ->limit(5)
            ->get();

        return response()->json([
            'kpis' => $kpis,
            'revenueTrend' => $revenueTrend,
            'topProducts' => $topProducts
        ]);
    }


    public function getAiInsights()
    {
        // 1. MARKET BASKET ANALYSIS: Cari menu yang sering dibeli bersamaan
        // Membandingkan isi keranjang yang sama (order_id sama)
        $pairs = DB::select("
            SELECT m1.name as menu1, m2.name as menu2, COUNT(*) as frekuensi
            FROM order_items a
            JOIN order_items b ON a.order_id = b.order_id AND a.menu_id < b.menu_id
            JOIN menus m1 ON a.menu_id = m1.id
            JOIN menus m2 ON b.menu_id = m2.id
            GROUP BY m1.name, m2.name
            ORDER BY frekuensi DESC
            LIMIT 3
        ");

        $pairText = "";
        foreach ($pairs as $p) {
            $pairText .= "- {$p->menu1} & {$p->menu2} (dibeli bersamaan {$p->frekuensi} kali)\n";
        }

        // 2. Susun Prompt (Perintah) untuk AI
        $prompt = "Anda adalah Konsultan Bisnis F&B yang jenius. Berikut adalah data analisis keranjang belanja (Market Basket Analysis) dari restoran kami:\n\n";
        $prompt .= "Kombinasi Menu Sering Dibeli:\n" . ($pairText ?: "Belum ada data cukup.\n") . "\n";
        $prompt .= "Berdasarkan data di atas, berikan 1 paragraf singkat (maksimal 3 kalimat) rekomendasi strategi promo bundling atau upselling. Jangan gunakan bahasa yang kaku, jadilah konsultan yang asik dan to the point.";

        // 3. Panggil Groq AI API
        $apiKey = env('GROQ_API_KEY'); // Pastikan key di .env bernama GROQ_API_KEY

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => 'llama3-8b-8192', // Model Llama 3 yang sangat cepat
                'messages' => [['role' => 'user', 'content' => $prompt]],
                'temperature' => 0.7
            ]);

            $result = $response->json();
            $insight = $result['choices'][0]['message']['content'] ?? 'AI gagal memberikan insight.';

            return response()->json(['status' => 'success', 'insight' => $insight]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'insight' => 'Koneksi ke Groq API gagal: ' . $e->getMessage()]);
        }
    }
}