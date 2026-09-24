<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json(['dark_mode' => $request->user()->dark_mode]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate(['dark_mode' => ['required', 'boolean']]);

        $request->user()->update($data);

        return response()->json(['dark_mode' => $request->user()->dark_mode]);
    }
}
