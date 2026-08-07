<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Application\Investment\Actions\CreateInvestment;
use App\Application\Investment\Actions\ListInvestments;
use App\Application\Investment\Actions\WithdrawInvestment;
use App\Application\Investment\InvestmentCalculator;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInvestmentRequest;
use App\Http\Requests\WithdrawalPreviewRequest;
use App\Http\Requests\WithdrawInvestmentRequest;
use App\Http\Resources\InvestmentResource;
use App\Models\Investment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InvestmentController extends Controller
{
    /**
     * List the authenticated user's investments (paginated).
     */
    public function index(Request $request, ListInvestments $action): AnonymousResourceCollection
    {
        $perPage = max(1, min($request->integer('per_page', 15), 100));

        return InvestmentResource::collection(
            $action->handle($request->user(), $perPage)
        );
    }

    /**
     * Create an investment owned by the authenticated user.
     */
    public function store(StoreInvestmentRequest $request, CreateInvestment $action): JsonResponse
    {
        $investment = $action->handle($request->user(), $request->toData());

        return InvestmentResource::make($investment->load('owner'))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Show a single investment with its expected balance and gains.
     */
    public function show(Investment $investment): InvestmentResource
    {
        $this->authorize('view', $investment);

        return InvestmentResource::make($investment->load('owner'));
    }

    /**
     * Preview the taxed net amount for a hypothetical withdrawal date.
     */
    public function withdrawalPreview(
        WithdrawalPreviewRequest $request,
        Investment $investment,
        InvestmentCalculator $calculator
    ): JsonResponse {
        $breakdown = $calculator->withdrawalAsOf($investment, $request->referenceDate());

        return response()->json([
            'data' => [
                'date' => $request->referenceDate()->toDateString(),
                'gross' => (string) $breakdown->balance->getAmount(),
                'gains' => (string) $breakdown->gains->getAmount(),
                'tax_rate' => (string) $breakdown->taxRate,
                'tax' => (string) $breakdown->tax->getAmount(),
                'net' => (string) $breakdown->net->getAmount(),
            ],
        ]);
    }

    /**
     * Fully withdraw an investment and return the settled figures.
     */
    public function withdraw(
        WithdrawInvestmentRequest $request,
        Investment $investment,
        WithdrawInvestment $action
    ): InvestmentResource {
        $withdrawn = $action->handle($investment, $request->toData());

        return InvestmentResource::make($withdrawn->load('owner'));
    }
}
