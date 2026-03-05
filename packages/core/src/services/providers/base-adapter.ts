import {
  LayerRequest,
  LayerResponse,
  Role,
  ImageDetail,
  ImageSize,
  ImageQuality,
  ImageStyle,
  VideoSize,
  AudioFormat,
  AudioMimeType,
  ImageMimeType,
  FinishReason,
  ToolChoice,
  EncodingFormat,
  ADAPTER_HANDLED,
  EmbedInputType,
} from '@layer-ai/sdk';
import type { Provider } from "../../lib/provider-constants.js";
import { getModel } from '../../lib/registry.js';

export { ADAPTER_HANDLED };

export abstract class BaseProviderAdapter {
  protected abstract provider: Provider;
  protected userId?: string;

  protected roleMappings?: Record<Role, string>;
  protected imageDetailMappings?: Record<ImageDetail, string>;
  protected toolChoiceMappings?: Record<string, string | object>;
  protected finishReasonMappings?: Record<string, FinishReason>;
  protected imageSizeMappings?: Record<ImageSize, string>;
  protected imageQualityMappings?: Record<ImageQuality, string>;
  protected imageStyleMappings?: Record<ImageStyle, string>;
  protected videoSizeMappings?: Record<VideoSize, string>;
  protected audioFormatMappings?: Record<AudioFormat, string>;
  protected audioMimeTypeMappings?: Record<AudioMimeType, string>;
  protected imageMimeTypeMappings?: Record<ImageMimeType, string>;
  protected encodingFormatMappings?: Record<EncodingFormat, string>;
  protected embeddingInputTypeMappings?: Record<EmbedInputType, string>;

  abstract call(request: LayerRequest, userId?: string): Promise<LayerResponse>;

  // streaming support (optional - adapters can implement if provider supports streaming)
  callStream?(request: LayerRequest, userId?: string): AsyncIterable<LayerResponse>;

  protected mapRole(role: Role): string {
    if (!this.roleMappings) {
      return role;
    }

    const mapped = this.roleMappings[role];

    if (mapped === ADAPTER_HANDLED) {
      return ADAPTER_HANDLED;
    }

    return mapped || role;
  }

  protected mapImageDetail(detail: ImageDetail): string | undefined {
    if (!this.imageDetailMappings) {
      return undefined;
    }

    return this.imageDetailMappings[detail];
  }

  protected mapImageSize(size: ImageSize): string | undefined {
    if (!this.imageSizeMappings) {
      return size;
    }

    return this.imageSizeMappings[size];
  }

  protected mapImageQuality(quality: ImageQuality): string | undefined {
    if (!this.imageQualityMappings) {
      return undefined;
    }

    return this.imageQualityMappings[quality];
  }

  protected mapImageStyle(style: ImageStyle): string | undefined {
    if (!this.imageStyleMappings) {
      return undefined;
    }

    return this.imageStyleMappings[style];
  }

  protected mapVideoSize(size: VideoSize): string | undefined {
    if (!this.videoSizeMappings) {
      return size;
    }

    return this.videoSizeMappings[size];
  }

  protected mapAudioFormat(format: AudioFormat): string | undefined {
    if (!this.audioFormatMappings) {
      return undefined;
    }

    return this.audioFormatMappings[format];
  }

  protected mapAudioMimeType(mimeType: AudioMimeType): string | undefined {
    if (!this.audioMimeTypeMappings) {
      return mimeType;
    }

    return this.audioMimeTypeMappings[mimeType];
  }

  protected mapImageMimeType(mimeType: ImageMimeType): string | undefined {
    if (!this.imageMimeTypeMappings) {
      return mimeType;
    }

    return this.imageMimeTypeMappings[mimeType];
  }

  protected mapEncodingFormat(format: EncodingFormat): string | undefined {
    if (!this.encodingFormatMappings) {
      return format;
    }

    return this.encodingFormatMappings[format];
  }

  protected mapFinishReason(providerFinishReason: string): FinishReason {
    if (!this.finishReasonMappings) {
      return 'completed';
    }

    return this.finishReasonMappings[providerFinishReason] || 'completed';
  }

  protected mapToolChoice(choice: ToolChoice): string | object | undefined {
    if (typeof choice === 'object') {
      return choice;
    }

    if (!this.toolChoiceMappings) {
      return choice;
    }

    return this.toolChoiceMappings[choice];
  }

  protected mapEmbeddingInputType(inputType: EmbedInputType): string | undefined {
    if (!this.embeddingInputTypeMappings) {
      return inputType;
    }

    return this.embeddingInputTypeMappings[inputType];
  }

  protected calculateCost(
    model: string,
    promptTokens: number,
    completionTokens: number
  ): number {
    const modelInfo = getModel(model);
    if (!modelInfo || !('pricing' in modelInfo) || !modelInfo.pricing?.input) {
      return 0;
    }
    const pricing = modelInfo.pricing;
    const inputCost = promptTokens / 1000000 * pricing.input;
    const outputCost = ('output' in pricing && pricing.output) ? (completionTokens / 1000000 * pricing.output) : 0;
    return inputCost + outputCost;
  }

  protected calculateImageCost(
    model: string,
    quality?: string,
    size?: string,
    count: number = 1
  ): number {
    const modelInfo = getModel(model);
    if (!modelInfo || !('unitPricing' in modelInfo) || !modelInfo.unitPricing) {
      return 0;
    }

    const unitPricing = modelInfo.unitPricing;

    // Flat-rate pricing (e.g. Google Imagen: unitPricing = 0.02)
    if (typeof unitPricing === 'number') {
      return unitPricing * count;
    }

    // Object pricing (e.g. DALL-E: unitPricing = { "hd-1024x1024": 0.08, ... })
    const pricingTable = unitPricing as Record<string, number>;
    const pricingKey = quality && size ? `${quality}-${size}` : size || 'standard-1024x1024';
    const pricePerImage = pricingTable[pricingKey];

    if (!pricePerImage) {
      // If exact match not found, try without quality prefix
      const fallbackPrice = pricingTable[size || '1024x1024'];
      return (fallbackPrice || 0) * count;
    }

    return pricePerImage * count;
  }

  protected calculateVideoCost(
    model: string,
    duration?: number,
    count: number = 1
  ): number {
    const modelInfo = getModel(model);
    if (!modelInfo || !('unitPricing' in modelInfo) || !modelInfo.unitPricing) {
      return 0;
    }

    const unitPricing = modelInfo.unitPricing;

    // Flat-rate pricing (e.g. unitPricing = 0.50 per video)
    if (typeof unitPricing === 'number') {
      return unitPricing * count;
    }

    // Object pricing with per_second or per_video keys
    const pricing = unitPricing as Record<string, number>;

    if (pricing.per_second && duration) {
      return pricing.per_second * duration * count;
    }

    if (pricing.per_video) {
      return pricing.per_video * count;
    }

    if (pricing.per_minute && duration) {
      return pricing.per_minute * (duration / 60) * count;
    }

    return 0;
  }
}
