<?php

/*namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class CheckSuperAdmin
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Token invalide'], 401);
        }

        if ($user->role !== 'super_admin') {
            return response()->json(['error' => 'Accès non autorisé'], 403);
        }

        return $next($request);
    }
}
