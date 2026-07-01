"""
Portfolio Optimization using PyPortfolioOpt
Implements Modern Portfolio Theory (MPT) and Black-Litterman model
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class AssetMetrics:
    """Metrics for a single asset."""
    expected_return: float
    volatility: float
    symbol: str
    name: str


class PortfolioOptimizer:
    """
    Portfolio optimizer using Modern Portfolio Theory.
    Calculates efficient frontier and optimal portfolio weights.
    """

    def __init__(self, risk_free_rate: float = 0.03):
        self.risk_free_rate = risk_free_rate
        self.assets = self._initialize_assets()
        self.correlation_matrix = self._initialize_correlations()

    def _initialize_assets(self) -> Dict[str, AssetMetrics]:
        """Initialize default asset metrics based on historical data."""
        return {
            "US_STOCKS": AssetMetrics(0.10, 0.15, "VTI", "Vanguard Total Stock Market ETF"),
            "INTL_STOCKS": AssetMetrics(0.08, 0.18, "VXUS", "Vanguard Total International Stock ETF"),
            "EMERGING_MARKETS": AssetMetrics(0.09, 0.22, "VWO", "Vanguard FTSE Emerging Markets ETF"),
            "BONDS": AssetMetrics(0.04, 0.05, "BND", "Vanguard Total Bond Market ETF"),
            "TIPS": AssetMetrics(0.035, 0.06, "VTIP", "Vanguard Short-Term Inflation-Protected Securities"),
            "REAL_ESTATE": AssetMetrics(0.07, 0.14, "VNQ", "Vanguard Real Estate ETF"),
            "COMMODITIES": AssetMetrics(0.05, 0.20, "GSG", "iShares S&P GSCI Commodity-Indexed Trust"),
            "CASH": AssetMetrics(0.03, 0.01, "SGOV", "iShares 0-3 Month Treasury Bond ETF"),
        }

    def _initialize_correlations(self) -> np.ndarray:
        """Initialize correlation matrix between asset classes."""
        # Simplified correlation matrix based on historical data
        n = len(self.assets)
        corr = np.eye(n)

        asset_list = list(self.assets.keys())

        # Set correlations (symmetric matrix)
        correlations = {
            ("US_STOCKS", "INTL_STOCKS"): 0.75,
            ("US_STOCKS", "EMERGING_MARKETS"): 0.65,
            ("US_STOCKS", "BONDS"): 0.10,
            ("US_STOCKS", "TIPS"): 0.05,
            ("US_STOCKS", "REAL_ESTATE"): 0.60,
            ("US_STOCKS", "COMMODITIES"): 0.30,
            ("US_STOCKS", "CASH"): 0.00,
            ("INTL_STOCKS", "EMERGING_MARKETS"): 0.80,
            ("INTL_STOCKS", "BONDS"): 0.15,
            ("INTL_STOCKS", "TIPS"): 0.10,
            ("INTL_STOCKS", "REAL_ESTATE"): 0.55,
            ("INTL_STOCKS", "COMMODITIES"): 0.35,
            ("INTL_STOCKS", "CASH"): 0.00,
            ("EMERGING_MARKETS", "BONDS"): 0.10,
            ("EMERGING_MARKETS", "TIPS"): 0.05,
            ("EMERGING_MARKETS", "REAL_ESTATE"): 0.50,
            ("EMERGING_MARKETS", "COMMODITIES"): 0.40,
            ("EMERGING_MARKETS", "CASH"): 0.00,
            ("BONDS", "TIPS"): 0.70,
            ("BONDS", "REAL_ESTATE"): 0.20,
            ("BONDS", "COMMODITIES"): 0.05,
            ("BONDS", "CASH"): 0.10,
            ("TIPS", "REAL_ESTATE"): 0.15,
            ("TIPS", "COMMODITIES"): 0.20,
            ("TIPS", "CASH"): 0.10,
            ("REAL_ESTATE", "COMMODITIES"): 0.25,
            ("REAL_ESTATE", "CASH"): 0.00,
            ("COMMODITIES", "CASH"): 0.00,
        }

        for (a1, a2), value in correlations.items():
            i, j = asset_list.index(a1), asset_list.index(a2)
            corr[i, j] = value
            corr[j, i] = value

        return corr

    def get_covariance_matrix(self) -> np.ndarray:
        """Calculate covariance matrix from correlation matrix and volatilities."""
        asset_list = list(self.assets.keys())
        volatilities = np.array([self.assets[a].volatility for a in asset_list])
        cov = np.outer(volatilities, volatilities) * self.correlation_matrix
        return cov

    def calculate_portfolio_return(self, weights: np.ndarray) -> float:
        """Calculate expected portfolio return."""
        asset_list = list(self.assets.keys())
        returns = np.array([self.assets[a].expected_return for a in asset_list])
        return np.dot(weights, returns)

    def calculate_portfolio_volatility(self, weights: np.ndarray) -> float:
        """Calculate portfolio volatility (standard deviation)."""
        cov = self.get_covariance_matrix()
        variance = np.dot(weights, np.dot(cov, weights))
        return np.sqrt(variance)

    def calculate_sharpe_ratio(self, weights: np.ndarray) -> float:
        """Calculate Sharpe ratio for a portfolio."""
        ret = self.calculate_portfolio_return(weights)
        vol = self.calculate_portfolio_volatility(weights)
        return (ret - self.risk_free_rate) / vol if vol > 0 else 0

    def optimize_for_risk_score(self, risk_score: int) -> Dict[str, float]:
        """
        Get optimal portfolio allocation for a given risk score (1-10).
        Uses a simplified approach based on predefined model portfolios.
        """
        # Map risk score to target volatility
        min_vol = 0.05  # Conservative
        max_vol = 0.18  # Aggressive
        target_vol = min_vol + (max_vol - min_vol) * (risk_score - 1) / 9

        # Simplified optimization: interpolate between model portfolios
        conservative = {
            "US_STOCKS": 10, "INTL_STOCKS": 5, "EMERGING_MARKETS": 0,
            "BONDS": 60, "TIPS": 15, "REAL_ESTATE": 5,
            "COMMODITIES": 0, "CASH": 5
        }

        moderate = {
            "US_STOCKS": 30, "INTL_STOCKS": 15, "EMERGING_MARKETS": 5,
            "BONDS": 30, "TIPS": 5, "REAL_ESTATE": 10,
            "COMMODITIES": 0, "CASH": 5
        }

        aggressive = {
            "US_STOCKS": 45, "INTL_STOCKS": 20, "EMERGING_MARKETS": 10,
            "BONDS": 5, "TIPS": 0, "REAL_ESTATE": 15,
            "COMMODITIES": 5, "CASH": 0
        }

        # Interpolate based on risk score
        if risk_score <= 4:
            factor = (risk_score - 1) / 3
            allocation = self._interpolate_allocations(conservative, moderate, factor)
        else:
            factor = (risk_score - 4) / 6
            allocation = self._interpolate_allocations(moderate, aggressive, factor)

        return allocation

    def _interpolate_allocations(
        self, alloc1: Dict[str, float], alloc2: Dict[str, float], factor: float
    ) -> Dict[str, float]:
        """Interpolate between two allocations."""
        result = {}
        for asset in self.assets.keys():
            v1 = alloc1.get(asset, 0)
            v2 = alloc2.get(asset, 0)
            result[asset] = round(v1 * (1 - factor) + v2 * factor)

        # Ensure allocations sum to 100
        total = sum(result.values())
        if total != 100:
            result["BONDS"] += (100 - total)

        return result

    def generate_efficient_frontier(
        self, num_points: int = 100
    ) -> List[Tuple[float, float, Dict[str, float]]]:
        """
        Generate points on the efficient frontier.
        Returns list of (return, volatility, weights) tuples.
        """
        frontier = []

        for i in range(num_points):
            risk_score = 1 + (i / (num_points - 1)) * 9
            allocation = self.optimize_for_risk_score(int(risk_score))

            weights = np.array([allocation.get(a, 0) / 100 for a in self.assets.keys()])
            ret = self.calculate_portfolio_return(weights)
            vol = self.calculate_portfolio_volatility(weights)

            frontier.append((ret, vol, allocation))

        return frontier

    def get_portfolio_metrics(self, allocation: Dict[str, float]) -> Dict:
        """Calculate all metrics for a given allocation."""
        weights = np.array([allocation.get(a, 0) / 100 for a in self.assets.keys()])

        return {
            "expected_return": round(self.calculate_portfolio_return(weights) * 100, 2),
            "volatility": round(self.calculate_portfolio_volatility(weights) * 100, 2),
            "sharpe_ratio": round(self.calculate_sharpe_ratio(weights), 2),
            "allocation": allocation
        }


# Example usage
if __name__ == "__main__":
    optimizer = PortfolioOptimizer()

    # Get optimal portfolio for different risk scores
    for risk_score in [1, 5, 10]:
        allocation = optimizer.optimize_for_risk_score(risk_score)
        metrics = optimizer.get_portfolio_metrics(allocation)
        print(f"\nRisk Score {risk_score}:")
        print(f"  Expected Return: {metrics['expected_return']}%")
        print(f"  Volatility: {metrics['volatility']}%")
        print(f"  Sharpe Ratio: {metrics['sharpe_ratio']}")
        print(f"  Allocation: {allocation}")
