<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ingredient;

class IngredientController extends Controller
{
    public function index()
    {
        $ingredients = Ingredient::where('shop_id', auth()->user()->shop_id)->get();
        return response()->json($ingredients);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'unit' => 'required|string',
            'current_stock' => 'required|numeric',
        ]);

        $validated['shop_id'] = auth()->user()->shop_id; // Menggunakan shop_id

        $ingredient = Ingredient::create($validated);
        return response()->json(['status' => 'success', 'data' => $ingredient]);
    }

    public function update(Request $request, $id)
    {
        $ingredient = Ingredient::where('shop_id', auth()->user()->shop_id)->findOrFail($id);
        $ingredient->update($request->all());
        return response()->json(['status' => 'success', 'data' => $ingredient]);
    }

    public function destroy($id)
    {
        $ingredient = Ingredient::where('shop_id', auth()->user()->shop_id)->findOrFail($id);
        $ingredient->delete();
        return response()->json(['status' => 'success', 'message' => 'Bahan baku dihapus.']);
    }

    public function addStock(Request $request, $id)
    {
        $request->validate(['added_stock' => 'required|numeric']);
        $ingredient = Ingredient::where('shop_id', auth()->user()->shop_id)->findOrFail($id);
        $ingredient->increment('current_stock', $request->added_stock);

        return response()->json(['status' => 'success', 'data' => $ingredient]);
    }
}