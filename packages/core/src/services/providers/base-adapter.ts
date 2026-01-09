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
  MODEL_REGISTRY,
  SupportedModel,
} from '@layer-ai/sdk';
import type { Provider } from "../../lib/provider-constants.js";

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

  abstract call(request: LayerRequest, userId?: string): Promise<LayerResponse>;

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

  protected calculateCost(
    model: string,
    promptTokens: number,
    completionTokens: number
  ): number {
    const modelInfo = MODEL_REGISTRY[model as SupportedModel];
    if (!modelInfo || !('pricing' in modelInfo) || !modelInfo.pricing?.input || !modelInfo.pricing?.output) {
      return 0;
    }
    return (promptTokens / 1000000 * modelInfo.pricing.input) + (completionTokens / 1000000 * modelInfo.pricing.output);
  }
}
