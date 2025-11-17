<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Exception;
use Illuminate\Support\Facades\Log;



class PatientController extends Controller
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
            'gender' => 'required|in:M,F',
            'poids' => 'nullable|numeric',
            'height' => 'nullable|numeric',
            'id_rec' => 'nullable|exists:receptionnistes,id_rec',
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
                'etat' => 'actif',
            ]);

            // Create Patient linked to this user via CIN
            Patient::create([
                'CIN' => $user->CIN,
                'gender' => $data['gender'],
                'poids' => $data['poids'] ?? null,
                'height' => $data['height'] ?? null,
                'id_rec' => $data['id_rec'] ?? null,
            ]);
        });

        return response()->json([
            'message' => 'Patient created successfully']);
            
        } catch (Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }



    }

    /**
     * Display the specified resource.
     */
    public function show(Patient $patient)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Patient $patient)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Patient $patient)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Patient $patient)
    {
        //
    }
}
