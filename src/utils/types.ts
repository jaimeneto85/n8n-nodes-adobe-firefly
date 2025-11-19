export interface ITextToImageInput {
  prompt: string;
  numberOfVariations?: number;
  size?: string;
  style?: string;
}

export interface ITextToVideoInput {
  prompt: string;
  duration?: number;
  aspectRatio?: string;
  style?: string;
}

export interface IExpandImageInput {
  imageUrl: string;
  width: number;
  height: number;
  prompt?: string;
}

export interface IFillImageInput {
  imageUrl: string;
  maskUrl: string;
  prompt: string;
}

export interface ISimilarImagesInput {
  imageUrl: string;
  prompt?: string;
  numberOfVariations?: number;
}

export interface IObjectCompositeInput {
  imageUrl: string;
  prompt: string;
}

