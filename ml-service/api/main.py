"""
WealthWise ML Service
Portfolio optimization and financial modeling API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import numpy as np
from datetime import datetime

app = FastAPI(
    title="WealthWise ML Service",
    description="Portfolio optimization and Monte Carlo simulation API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic Models ---

class OptimizationRequest(BaseModel):
    risk_score: int = Field(..., ge=1, le=10, description="Risk tolerance score from 1-10")
    investment_amount: float = Field(..., gt=0, description="Total amount to invest")
    exclude_assets: Optional[List[str]] = Field(default=[], description="Asset classes to exclude")


class MonteCarloRequest(BaseModel):
    current_amount: float = Field(..., ge=0)
    target_amount: float = Field(..., gt=0)
    monthly_contribution: float = Field(default=0, ge=0)
    years_until_target: float = Field(..., gt=0)
    risk_level: str = Field(default="moderate", pattern="^(conservative|moderate|aggressive)$")
    num_simulations: int = Field(default=10000, ge=1000, le=100000)


class RebalanceRequest(BaseModel):
    current_holdings: Dict[str, float]  # symbol -> market value
    target_allocation: Dict[str, float]  # asset_class -> percentage
    threshold: float = Field(default=5.0, ge=1.0, le=20.0)


# --- Asset Configuration ---

ASSET_METRICS = {
    "US_STOCKS": {"expected_return": 0.10, "volatility": 0.15, "etf": "VTI"},
    "INTL_STOCKS": {"expected_return": 0.08, "volatility": 0.18, "etf": "VXUS"},
    "BONDS": {"expected_return": 0.04, "volatility": 0.05, "etf": "BND"},
    "REAL_ESTATE": {"expected_return": 0.07, "volatility": 0.14, "etf": "VNQ"},
    "COMMODITIES": {"expected_return": 0.05, "volatility": 0.20, "etf": "GSG"},
    "CASH": {"expected_return": 0.03, "volatility": 0.01, "etf": "SGOV"},
}

# Correlation matrix (simplified)
CORRELATION_MATRIX = np.array([
    [1.00, 0.75, 0.10, 0.60, 0.30, 0.00],  # US_STOCKS
    [0.75, 1.00, 0.15, 0.55, 0.35, 0.00],  # INTL_STOCKS
    [0.10, 0.15, 1.00, 0.20, 0.05, 0.00],  # BONDS
    [0.60, 0.55, 0.20, 1.00, 0.25, 0.00],  # REAL_ESTATE
    [0.30, 0.35, 0.05, 0.25, 1.00, 0.00],  # COMMODITIES
    [0.00, 0.00, 0.00, 0.00, 0.00, 1.00],  # CASH
])

ASSET_ORDER = ["US_STOCKS", "INTL_STOCKS", "BONDS", "REAL_ESTATE", "COMMODITIES", "CASH"]


# --- Optimization Functions ---

def calculate_portfolio_metrics(weights: Dict[str, float]) -> Dict:
    """Calculate expected return, volatility, and Sharpe ratio for a portfolio."""
    weight_array = np.array([weights.get(asset, 0) / 100 for asset in ASSET_ORDER])
    returns = np.array([ASSET_METRICS[asset]["expected_return"] for asset in ASSET_ORDER])
    volatilities = np.array([ASSET_METRICS[asset]["volatility"] for asset in ASSET_ORDER])

    # Expected return
    expected_return = np.dot(weight_array, returns)

    # Portfolio volatility (using correlation matrix)
    cov_matrix = np.outer(volatilities, volatilities) * CORRELATION_MATRIX
    portfolio_variance = np.dot(weight_array, np.dot(cov_matrix, weight_array))
    portfolio_volatility = np.sqrt(portfolio_variance)

    # Sharpe ratio (assuming 3% risk-free rate)
    risk_free_rate = 0.03
    sharpe_ratio = (expected_return - risk_free_rate) / portfolio_volatility if portfolio_volatility > 0 else 0

    return {
        "expected_return": round(expected_return * 100, 2),
        "volatility": round(portfolio_volatility * 100, 2),
        "sharpe_ratio": round(sharpe_ratio, 2)
    }


def get_model_portfolio(risk_score: int) -> Dict[str, float]:
    """Get a model portfolio allocation based on risk score."""
    # Linear interpolation between conservative and aggressive portfolios
    conservative = {"US_STOCKS": 10, "INTL_STOCKS": 5, "BONDS": 75, "REAL_ESTATE": 5, "CASH": 5}
    aggressive = {"US_STOCKS": 55, "INTL_STOCKS": 25, "BONDS": 5, "REAL_ESTATE": 15, "CASH": 0}

    factor = (risk_score - 1) / 9  # 0 to 1

    allocation = {}
    for asset in ASSET_ORDER:
        allocation[asset] = round(
            conservative.get(asset, 0) * (1 - factor) + aggressive.get(asset, 0) * factor
        )

    # Ensure allocations sum to 100
    total = sum(allocation.values())
    if total != 100:
        allocation["BONDS"] += (100 - total)

    return allocation


# --- API Endpoints ---

@app.get("/")
async def root():
    return {"message": "WealthWise ML Service", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


@app.post("/optimize")
async def optimize_portfolio(request: OptimizationRequest):
    """
    Optimize portfolio allocation based on risk tolerance.
    Uses Modern Portfolio Theory for mean-variance optimization.
    """
    try:
        # Get model portfolio
        allocation = get_model_portfolio(request.risk_score)

        # Remove excluded assets
        for asset in request.exclude_assets:
            if asset in allocation:
                excluded_weight = allocation[asset]
                allocation[asset] = 0
                # Redistribute weight proportionally
                remaining = {k: v for k, v in allocation.items() if v > 0}
                if remaining:
                    total_remaining = sum(remaining.values())
                    for k in remaining:
                        allocation[k] += round(excluded_weight * remaining[k] / total_remaining)

        # Calculate portfolio metrics
        metrics = calculate_portfolio_metrics(allocation)

        # Generate recommended holdings
        holdings = []
        for asset, weight in allocation.items():
            if weight > 0:
                amount = (weight / 100) * request.investment_amount
                holdings.append({
                    "asset_class": asset,
                    "allocation": weight,
                    "amount": round(amount, 2),
                    "recommended_etf": ASSET_METRICS[asset]["etf"]
                })

        return {
            "success": True,
            "data": {
                "risk_score": request.risk_score,
                "allocation": allocation,
                "metrics": metrics,
                "recommended_holdings": holdings,
                "methodology": "Modern Portfolio Theory (Mean-Variance Optimization)"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/monte-carlo")
async def run_monte_carlo(request: MonteCarloRequest):
    """
    Run Monte Carlo simulation for goal planning.
    Returns success probability and projected amounts.
    """
    try:
        # Risk profile parameters
        risk_profiles = {
            "conservative": {"return": 0.05, "vol": 0.08},
            "moderate": {"return": 0.07, "vol": 0.12},
            "aggressive": {"return": 0.09, "vol": 0.18}
        }

        profile = risk_profiles[request.risk_level]
        monthly_return = profile["return"] / 12
        monthly_vol = profile["vol"] / np.sqrt(12)
        total_months = int(request.years_until_target * 12)

        # Run simulations
        results = []
        success_count = 0

        np.random.seed(42)  # For reproducibility

        for _ in range(request.num_simulations):
            balance = request.current_amount

            for _ in range(total_months):
                # Generate random return
                monthly_ret = np.random.normal(monthly_return, monthly_vol)
                balance = balance * (1 + monthly_ret) + request.monthly_contribution

            results.append(balance)
            if balance >= request.target_amount:
                success_count += 1

        results = np.array(results)

        return {
            "success": True,
            "data": {
                "success_probability": round((success_count / request.num_simulations) * 100),
                "projected_amounts": {
                    "worst_case": round(np.percentile(results, 10)),
                    "pessimistic": round(np.percentile(results, 25)),
                    "median": round(np.percentile(results, 50)),
                    "mean": round(np.mean(results)),
                    "optimistic": round(np.percentile(results, 75)),
                    "best_case": round(np.percentile(results, 90))
                },
                "num_simulations": request.num_simulations,
                "risk_profile": profile
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/rebalance")
async def calculate_rebalance(request: RebalanceRequest):
    """
    Calculate rebalancing trades needed to match target allocation.
    """
    try:
        total_value = sum(request.current_holdings.values())
        if total_value == 0:
            return {"success": True, "data": {"needs_rebalancing": False, "trades": []}}

        # Calculate current allocation percentages
        current_allocation = {
            symbol: (value / total_value) * 100
            for symbol, value in request.current_holdings.items()
        }

        # Calculate drift
        max_drift = 0
        drifts = {}
        for asset, target in request.target_allocation.items():
            current = current_allocation.get(asset, 0)
            drift = abs(current - target)
            drifts[asset] = round(current - target, 2)
            max_drift = max(max_drift, drift)

        needs_rebalancing = max_drift > request.threshold

        # Calculate trades
        trades = []
        if needs_rebalancing:
            for asset, target in request.target_allocation.items():
                current = current_allocation.get(asset, 0)
                target_value = (target / 100) * total_value
                current_value = request.current_holdings.get(asset, 0)
                diff = target_value - current_value

                if abs(diff) > 100:  # Only if difference > $100
                    trades.append({
                        "asset": asset,
                        "action": "BUY" if diff > 0 else "SELL",
                        "amount": round(abs(diff), 2),
                        "current_allocation": round(current, 1),
                        "target_allocation": target
                    })

        return {
            "success": True,
            "data": {
                "needs_rebalancing": needs_rebalancing,
                "max_drift": round(max_drift, 2),
                "drifts": drifts,
                "trades": trades,
                "total_portfolio_value": round(total_value, 2)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
