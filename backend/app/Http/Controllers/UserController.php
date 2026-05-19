<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // READ: Tampilkan daftar user HANYA yang berada di toko yang sama
    public function index()
    {
        $users = User::where('shop_id', auth()->user()->shop_id)->get();
        return response()->json($users);
    }

    // CREATE: Tambah user (Kasir/Admin) dan otomatis masukkan ke toko ini
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:admin,cashier'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'shop_id' => auth()->user()->shop_id, // Kunci utama: tempelkan shop_id milik admin yang sedang login
        ]);

        return response()->json(['status' => 'success', 'data' => $user]);
    }

    // UPDATE: Edit data user (Hanya jika user tersebut karyawan di tokonya)
    public function update(Request $request, $id)
    {
        // Cari user berdasarkan ID, TAPI pastikan dia bagian dari toko ini
        $user = User::where('shop_id', auth()->user()->shop_id)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$id, // Izinkan email yang sama asal milik user ini sendiri
            'role' => 'required|string|in:admin,cashier'
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
        ];

        // Jika form mengirim password baru, update password-nya. Jika tidak, biarkan yang lama.
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json(['status' => 'success', 'data' => $user]);
    }

    // DELETE: Hapus user (Hanya jika user tersebut karyawan di tokonya)
    public function destroy($id)
    {
        // Cari user berdasarkan ID dan shop_id
        $user = User::where('shop_id', auth()->user()->shop_id)->findOrFail($id);

        // Mencegah Admin menghapus akunnya sendiri (Bunuh Diri / Error)
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Tindakan ditolak! Anda tidak dapat menghapus akun Anda sendiri.'], 403);
        }

        $user->delete();

        return response()->json(['status' => 'success', 'message' => 'User berhasil dihapus.']);
    }
}