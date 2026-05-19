<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index(Request $request)
    {
        $setting = Setting::where('shop_id', $request->user()->shop_id)->first();

        if (!$setting) {
            return response()->json([
                'store_name' => 'Toko Baru',
                'tax_percentage' => 0,
                'logo_url' => null
            ]);
        }
        return response()->json($setting);
    }

    public function update(Request $request)
    {
        $request->validate([
            'store_name' => 'required|string',
            'tax_percentage' => 'required|numeric',
            'logo' => 'nullable|image|max:2048' 
        ]);

        // Gunakan shop_id
        $setting = Setting::firstOrCreate(
            ['shop_id' => $request->user()->shop_id],
            ['store_name' => 'Toko Baru', 'tax_percentage' => 0]
        );

        $setting->store_name = $request->store_name;
        $setting->tax_percentage = $request->tax_percentage;

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'public');
            $setting->logo_url = asset('storage/' . $path);
        }

        $setting->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Pengaturan berhasil disimpan',
            'data' => $setting
        ]);
    }
}