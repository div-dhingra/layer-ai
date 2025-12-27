export interface PricingData {
  modelId: string;
  input?: number;
  output?: number;
  sources: string[];
  confidence: 'high' | 'medium' | 'low';
}

interface PricingSource {
  name: string;
  fetch: () => Promise<Map<string, { input?: number; output?: number }>>;
}

async function fetchOfficialPricing(): Promise<Map<string, { input?: number; output?: number }>> {
  const pricing = new Map<string, { input?: number; output?: number }>();

  // TODO: Implement scrapers for official pricing pages
  // For now, return empty map

  return pricing;
}

async function fetchPricePerToken(): Promise<Map<string, { input?: number; output?: number }>> {
  const pricing = new Map<string, { input?: number; output?: number }>();

  try {
    console.log('⚠️  PricePerToken scraping not implemented - using manual data');
  } catch (error) {
    console.error('Failed to fetch from PricePerToken:', error);
  }

  return pricing;
}

async function fetchHelicone(): Promise<Map<string, { input?: number; output?: number }>> {
  const pricing = new Map<string, { input?: number; output?: number }>();

  try {
    console.log('⚠️  Helicone fetching not implemented - using manual data');
  } catch (error) {
    console.error('Failed to fetch from Helicone:', error);
  }

  return pricing;
}

function correlatePricing(
  sources: Array<{ name: string; data: Map<string, { input?: number; output?: number }> }>
): Map<string, PricingData> {
  const correlated = new Map<string, PricingData>();

  const allModelIds = new Set<string>();
  sources.forEach(source => {
    source.data.forEach((_, modelId) => allModelIds.add(modelId));
  });

  allModelIds.forEach(modelId => {
    const prices: Array<{ input?: number; output?: number; source: string }> = [];

    sources.forEach(source => {
      const price = source.data.get(modelId);
      if (price) {
        prices.push({ ...price, source: source.name });
      }
    });

    if (prices.length === 0) return;

    const inputPrices = prices.filter(p => p.input !== undefined).map(p => p.input!);
    const outputPrices = prices.filter(p => p.output !== undefined).map(p => p.output!);

    // Check agreement within 1% tolerance
    const inputAgrees = inputPrices.length > 1 &&
      inputPrices.every(p => Math.abs(p - inputPrices[0]) / inputPrices[0] < 0.01);
    const outputAgrees = outputPrices.length > 1 &&
      outputPrices.every(p => Math.abs(p - outputPrices[0]) / outputPrices[0] < 0.01);

    let confidence: 'high' | 'medium' | 'low';
    if (prices.length >= 3 && inputAgrees && outputAgrees) {
      confidence = 'high';
    } else if (prices.length >= 2) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }

    correlated.set(modelId, {
      modelId,
      input: inputPrices.length > 0 ? inputPrices[0] : undefined,
      output: outputPrices.length > 0 ? outputPrices[0] : undefined,
      sources: prices.map(p => p.source),
      confidence,
    });
  });

  return correlated;
}

export async function fetchCorroboratedPricing(): Promise<Map<string, PricingData>> {
  console.log('🔍 Fetching pricing from multiple sources...\n');

  const sources = [
    { name: 'official', data: await fetchOfficialPricing() },
    { name: 'pricepertoken', data: await fetchPricePerToken() },
    { name: 'helicone', data: await fetchHelicone() },
  ];

  const correlated = correlatePricing(sources);

  console.log(`✅ Corroborated pricing for ${correlated.size} models`);

  const confidenceCounts = { high: 0, medium: 0, low: 0 };
  correlated.forEach(pricing => {
    confidenceCounts[pricing.confidence]++;
  });

  console.log(`   Confidence: ${confidenceCounts.high} high, ${confidenceCounts.medium} medium, ${confidenceCounts.low} low\n`);

  return correlated;
}
