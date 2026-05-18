<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Menu;

class MenuController extends Controller
{
    // READ: Ambil semua menu
    public function index() {
        return response()->json(Menu::all());
    }

    // CREATE: Tambah menu baru
    public function store(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string',
            'category' => 'required|string',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'image' => 'nullable|string'
        ]);
        
        $menu = Menu::create($validated);
        return response()->json(['status' => 'success', 'data' => $menu]);
    }

    // UPDATE: Ubah data menu
    public function update(Request $request, $id) {
        $menu = Menu::findOrFail($id);
        $menu->update($request->all());
        return response()->json(['status' => 'success', 'data' => $menu]);
    }

    // DELETE: Hapus menu
    public function destroy($id) {
        Menu::destroy($id);
        return response()->json(['status' => 'success', 'message' => 'Menu dihapus.']);
    }
}