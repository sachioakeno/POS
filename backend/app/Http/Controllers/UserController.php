<?php
namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller {
    public function index(Request $request) {
        // Only return users belonging to this admin's store
        return User::where('id', '!=', $request->user()->id)
                   ->select('id','name','email','role','created_at')
                   ->get();
    }

    public function store(Request $request) {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'required|in:cashier,admin',
        ]);
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);
        return response()->json($user, 201);
    }

    public function update(Request $request, $id) {
        $user = User::findOrFail($id);
        $user->update($request->only('name', 'role'));
        return response()->json($user);
    }

    public function destroy($id) {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'User deleted']);
    }
}