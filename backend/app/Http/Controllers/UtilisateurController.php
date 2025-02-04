<?php
// app/Http/Controllers/UtilisateurController.php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
//use Tymon\JWTAuth\Exceptions\JWTException;

class UtilisateurController extends Controller
{
    public function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'role' => 'required|in:admin_simple,super_admin',
            'telephone' => 'required|string|max:20|unique:utilisateurs',
            'adresse' => 'required|string|max:255',
            'carte_rfid' => 'required|string|max:255|unique:utilisateurs',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $matricule = $this->generateMatricule($request->role);
        $code_secret = $this->generateCodeSecret();

        $utilisateur = Utilisateur::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'matricule' => $matricule,
            'code_secret' => $code_secret,
            'carte_rfid' => $request->carte_rfid,
            'role' => $request->role,
            'telephone' => $request->telephone,
            'adresse' => $request->adresse,
        ]);

        return response()->json(['message' => 'Utilisateur créé avec succès', 'utilisateur' => $utilisateur], 201);
    }

    public function list()
    {
        $utilisateurs = Utilisateur::all();
        return response()->json(['utilisateurs' => $utilisateurs], 200);
    }

    public function delete($id)
    {
        $utilisateur = Utilisateur::find($id);
        if (!$utilisateur) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }
        $utilisateur->delete();
        return response()->json(['message' => 'Utilisateur supprimé avec succès'], 200);
    }

    public function deleteMultiple(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'exists:utilisateurs,_id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $ids = $request->input('ids');
        Utilisateur::whereIn('_id', $ids)->delete();

        return response()->json(['message' => 'Utilisateurs supprimés avec succès'], 200);
    }

    public function update(Request $request, $id)
    {
        $utilisateur = Utilisateur::find($id);
        if (!$utilisateur) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
            'role' => 'sometimes|required|in:admin_simple,super_admin',
            'telephone' => 'sometimes|required|string|max:20|unique:utilisateurs,telephone,' . $id,
            'adresse' => 'sometimes|required|string|max:255',
            'carte_rfid' => 'sometimes|required|string|max:255|unique:utilisateurs,carte_rfid,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $utilisateur->update($request->only(['nom', 'prenom', 'role', 'telephone', 'adresse', 'carte_rfid']));
        return response()->json(['message' => 'Utilisateur mis à jour avec succès', 'utilisateur' => $utilisateur], 200);
    }

    public function getUtilisateur($id)
    {
        $utilisateur = Utilisateur::find($id);
        if (!$utilisateur) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }
        return response()->json(['utilisateur' => $utilisateur], 200);
    }

    public function checkTelephoneExists($telephone)
    {
        $exists = Utilisateur::where('telephone', $telephone)->exists();
        return response()->json(['exists' => $exists], 200);
    }

    public function checkCarteRfidExists($carte_rfid)
    {
        $exists = Utilisateur::where('carte_rfid', $carte_rfid)->exists();
        return response()->json(['exists' => $exists], 200);
    }

    private function generateMatricule($role)
    {
        $prefix = $role === 'admin_simple' ? 'AS' : 'SP';
        $randomNumber = str_pad(mt_rand(0, 999), 3, '0', STR_PAD_LEFT);
        return $prefix . '-' . $randomNumber;
    }

    private function generateCodeSecret()
    {
        return str_pad(mt_rand(0, 9999), 4, '0', STR_PAD_LEFT);
    }

    public function loginByCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code_secret' => 'required|numeric|digits:4',  // Validation du code secret :chiffre uniquement avec longueur 4
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }
    
        $code_secret = $request->input('code_secret');
        $utilisateur = Utilisateur::where('code_secret', $code_secret)->first();
    
        if ($utilisateur) {
            // Générer un token JWT pour l'utilisateur
            $token = JWTAuth::fromUser($utilisateur);
            
            return response()->json([
                'message' => 'Connexion réussie',
                'token' => $token,
                'user' => [
                    'nom' => $utilisateur->nom,
                    'prenom' => $utilisateur->prenom,
                    'role' => $utilisateur->role
                ]
            ], 201);
        } else {
            return response()->json(['error' => 'Code incorrect'], 401);
        }
    }
    

    public function logout(Request $request)
    {
        $token = $request->bearerToken();
    
        if (!$token) {
            return response()->json(['error' => 'Token non fourni'], 400);
        }
    
        try {
            // Optionnel : vérifier si le token est valide avant d'invalider
            $tokenPayload = JWTAuth::setToken($token)->getPayload();
    
            if ($tokenPayload) {
                JWTAuth::invalidate($token);
                return response()->json(['message' => 'Déconnexion réussie'], 200);
            }
    
            return response()->json(['error' => 'Token invalide ou expiré'], 401);
            
        } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
            return response()->json(['error' => 'Le token est déjà expiré'], 401);
        } catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
            return response()->json(['error' => 'Token invalide'], 401);
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json(['error' => 'Impossible d\'invalider le token'], 500);
        }
    }
    

}
