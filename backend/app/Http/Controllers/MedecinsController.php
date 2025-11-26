<?php

namespace App\Http\Controllers;

use App\Models\Diagnostic;
use App\Models\Medecins;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Exception;
use Illuminate\Support\Facades\Log;

class MedecinsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate request
        $data = $request->validate([
            'CIN' => 'required|string|unique:users',
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'date_naissance' => 'required|date',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'adresse' => 'nullable|string',
            'num_tel' => 'nullable|string',
            'annee_travail' => 'required|digits:4|integer|min:2000|max:' . date('Y'),
            'description' => 'nullable|string',
            'specialite' => 'required|string'
        ]);

        try{
            DB::transaction(function() use ($data) {
            // Create User
            $user = User::create([
                'CIN' => $data['CIN'],
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'date_naissance' => $data['date_naissance'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'adresse' => $data['adresse'] ?? null,
                'num_tel' => $data['num_tel'] ?? null,
                'etat' => 'inactif',
            ]);

            // Create Medecin linked to this user via CIN
            Medecins::create([
                'CIN' => $data['CIN'],
                'annee_travail' => $data['annee_travail'],
                'description' => $data['description'] ?? null,
                'specialite' => $data['specialite']
            ]);
        });

        return response()->json([
            'message' => 'Medecin created successfully']);

        } catch (Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Medecins $medecins)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Medecins $medecins)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Medecins $medecin)
    {
        //validation des donnees
        $data = $request->validate([
            'CIN' => 'sometimes|string|unique:users',
            'nom' => 'sometimes|string',
            'prenom' => 'sometimes|string',
            'date_naissance' => 'sometimes|date',
            'email' => 'sometimes|email|unique:users',
            'password' => 'sometimes|string|min:6',
            'adresse' => 'nullable|string',
            'num_tel' => 'nullable|string',
            'annee_travail' => 'sometimes|digits:4|integer|min:2000|max:' . date('Y'),
            'description' => 'nullable|string',
            'specialite' => 'sometimes|string'
    ]);

    try {// mettre a jour l'utilisateur
        if ($medecin->user) {

            // mettre a jour medecin
            $medecin->user->update($data);
        }

        return response()->json(['message' => 'Medecin updated successfully']);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Medecins $medecins)
    {
        //
    }

    public function changeState(Medecins $idM,Diagnostic $idD) {
        $diagnostic = Diagnostic::find($idD);
        $medecin = Medecins::find($idM);
        $diagnostic->etat = $diagnostic->etat == 'appouver' ? 'enAttente' : 'approuver';
        $diagnostic->id_medecin = $medecin->id_medecin ;
        $diagnostic->save();
        return response()->json(['message' => 'User state changed successfully']);
    }
}
