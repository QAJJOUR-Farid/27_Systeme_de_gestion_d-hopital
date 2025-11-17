<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\InfirmiersController;
use App\Http\Controllers\MagasiniersController;
use App\Http\Controllers\MedecinsController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ReceptionnistesController;
use Illuminate\Support\Facades\Route;


Route::post('/patients', [PatientController::class, 'store']);
Route::post('/receptionnistes',[ReceptionnistesController::class,'store']);
Route::post('/medecins',[MedecinsController::class,'store']);
Route::post('/magasiniers',[MagasiniersController::class,'store']);
Route::post('/admin',[AdminController::class,'store']);
Route::post('/infirmiers',[InfirmiersController::class,'store']);
