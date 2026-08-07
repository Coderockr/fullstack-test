<?php

declare(strict_types=1);

use App\Domain\Investment\Exceptions\AmountNotPositive;
use App\Domain\Investment\Exceptions\InvestmentAlreadyWithdrawn;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        // Domain rule conflicts map to explicit HTTP semantics.
        $exceptions->render(
            fn (InvestmentAlreadyWithdrawn $e) => response()->json(['message' => $e->getMessage()], 409),
        );

        $exceptions->render(
            fn (AmountNotPositive $e) => response()->json([
                'message' => $e->getMessage(),
                'errors' => ['amount' => [$e->getMessage()]],
            ], 422),
        );
    })->create();
