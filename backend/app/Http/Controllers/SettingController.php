<?php
namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        // Jika data belum ada, otomatis buat defaultnya
        $setting = Setting::firstOrCreate(
            ['id' => 1],
            ['store_name' => 'Cafe', 'tax_percentage' => 10]
        );
        return response()->json($setting);
    }

    public function update(Request $request)
    {
        $setting = Setting::first();
        
        $data = [
            'store_name' => $request->store_name,
            'tax_percentage' => $request->tax_percentage,
        ];

        // Jika user mengupload file gambar logo
        if ($request->hasFile('logo')) {
            // Simpan gambar ke folder storage/app/public/logos
            $path = $request->file('logo')->store('logos', 'public');
            // Buat URL publiknya
            $data['logo_url'] = url('storage/' . $path);
        }

        $setting->update($data);
        return response()->json(['message' => 'Pengaturan berhasil disimpan!', 'data' => $setting]);
    }
}