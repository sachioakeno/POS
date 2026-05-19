<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Menu;

class MenuController extends Controller
{
    public function index()
    {
        $menus = Menu::where('shop_id', auth()->user()->shop_id)->get();
        return response()->json($menus);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'category' => 'required|string',
            'price' => 'required|numeric',
            'hpp' => 'nullable|numeric',
            'description' => 'nullable|string',
            'image' => 'nullable|string'
        ]);

        $validated['shop_id'] = auth()->user()->shop_id; // Menggunakan shop_id

        $menu = Menu::create($validated);
        return response()->json(['status' => 'success', 'data' => $menu]);
    }

    public function update(Request $request, $id)
    {
        $menu = Menu::where('shop_id', auth()->user()->shop_id)->findOrFail($id);
        $menu->update($request->all());
        return response()->json(['status' => 'success', 'data' => $menu]);
    }

    public function destroy($id)
    {
        $menu = Menu::where('shop_id', auth()->user()->shop_id)->findOrFail($id);
        $menu->delete();
        return response()->json(['status' => 'success', 'message' => 'Menu dihapus.']);
    }
}