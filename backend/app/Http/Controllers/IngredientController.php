<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ingredient;

class IngredientController extends Controller
{
    public function index() {
        return response()->json(Ingredient::all());
    }

    // CREATE: Tambah Bahan Baku Baru
    public function store(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string',
            'unit' => 'required|string',
            'current_stock' => 'required|numeric'
        ]);
        $ingredient = Ingredient::create($validated);
        return response()->json(['status' => 'success', 'data' => $ingredient]);
    }

    // UPDATE: Edit Nama atau Satuan
    public function update(Request $request, $id) {
        $ingredient = Ingredient::findOrFail($id);
        $ingredient->update($request->all());
        return response()->json(['status' => 'success', 'data' => $ingredient]);
    }

    // UPDATE: Tambah Stok (Restok)
    public function addStock(Request $request, $id) {
        $request->validate(['added_stock' => 'required|numeric|min:1']);
        $ingredient = Ingredient::findOrFail($id);
        $ingredient->increment('current_stock', $request->added_stock);
        return response()->json(['status' => 'success', 'data' => $ingredient]);
    }

    // DELETE: Hapus Bahan Baku
    public function destroy($id) {
        Ingredient::destroy($id);
        return response()->json(['status' => 'success', 'message' => 'Bahan dihapus.']);
    }
}