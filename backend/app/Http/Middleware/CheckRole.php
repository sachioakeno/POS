<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Cek apakah user sudah login DAN role-nya sesuai dengan yang diizinkan
        if (!$request->user() || !in_array($request->user()->role, $roles)) {
            return response()->json(['message' => 'Forbidden Access. Anda bukan Admin.'], 403);
        }

        return $next($request);
    }
}