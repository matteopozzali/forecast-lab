import { ModelKPI, ModelName } from './types';

interface InterpretationResult {
  text: string;
}

export function generateInterpretation(
  models: ModelKPI[],
  bestModel: ModelName,
  locale: string = 'en'
): InterpretationResult {
  const sorted = [...models].sort((a, b) => a.kpis.mae - b.kpis.mae);
  const best = sorted[0];
  const runner = sorted.length > 1 ? sorted[1] : null;
  const bias = best.kpis.bias;
  const absBias = Math.abs(bias);
  const biasPct = best.kpis.mae > 0 ? ((absBias / best.kpis.mae) * 100).toFixed(1) : '0';

  if (locale === 'it') {
    let text = `${best.label} è il miglior modello per questa serie, con un MAE di ${best.kpis.mae.toFixed(1)}.`;

    if (runner) {
      const improvement = (
        ((runner.kpis.mae - best.kpis.mae) / runner.kpis.mae) * 100
      ).toFixed(1);
      text += ` Batte il secondo classificato (${runner.label}) del ${improvement}%.`;
    }

    if (absBias > best.kpis.mae * 0.15) {
      if (bias > 0) {
        text += ` Il modello tende a sovrastimare del ${biasPct}%. Se gestisci l'inventario, considera una leggera riduzione del safety stock.`;
      } else {
        text += ` Il modello tende a sottostimare del ${biasPct}%. Se gestisci l'inventario, considera un leggero aumento del safety stock.`;
      }
    } else {
      text += ` Il bias è contenuto (${biasPct}% del MAE), indicando previsioni ben bilanciate.`;
    }

    if (bestModel === 'naive' || bestModel === 'seasonalNaive') {
      text += ` Il fatto che un benchmark semplice sia il miglior modello suggerisce che il pattern di domanda è relativamente stabile e non beneficia significativamente di aggiustamenti per trend o stagionalità.`;
    }

    return { text };
  }

  // English
  let text = `${best.label} is the best model for this series, with a MAE of ${best.kpis.mae.toFixed(1)}.`;

  if (runner) {
    const improvement = (
      ((runner.kpis.mae - best.kpis.mae) / runner.kpis.mae) * 100
    ).toFixed(1);
    text += ` It beats the runner-up (${runner.label}) by ${improvement}%.`;
  }

  if (absBias > best.kpis.mae * 0.15) {
    if (bias > 0) {
      text += ` The model tends to over-forecast by ${biasPct}%. If you are managing inventory, consider a small safety stock reduction.`;
    } else {
      text += ` The model tends to under-forecast by ${biasPct}%. If you are managing inventory, consider increasing safety stock.`;
    }
  } else {
    text += ` The bias is contained (${biasPct}% of MAE), indicating well-balanced forecasts.`;
  }

  if (bestModel === 'naive' || bestModel === 'seasonalNaive') {
    text += ` The fact that a simple benchmark is the best model suggests the demand pattern is relatively stable and does not benefit significantly from trend or seasonal adjustments.`;
  }

  return { text };
}
