/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* tslint:disable */
import {GoogleAuth, GoogleAuthOptions} from 'google-auth-library';

import {GenerativeModelPreview, GenerativeModel} from './models';
import {
  GetGenerativeModelParams,
  ModelParams,
  RequestOptions,
  VertexInit,
} from './types/content';
import {GoogleAuthError} from './types/errors';

/**
 * The `VertexAI` class is the base class for authenticating to Vertex AI.
 * To use Vertex AI's generative AI models, use the `getGenerativeModel` method.
 * To use generative AI features that are in Preview, use the `preview`
 * namespace.
 */
export class VertexAI {
  public readonly preview: VertexAIPreview;
  private readonly project: string;
  private readonly location: string;
  private readonly googleAuth: GoogleAuth;
  private readonly apiEndpoint?: string;

  /**
   * @constructor
   * @param init - assign authentication related information,
   *     including the project and location strings, to instantiate a Vertex AI
   * client.
   */
  constructor(init: VertexInit) {
    const opts = validateGoogleAuthOptions(
      init.project,
      init.googleAuthOptions
    );
    this.project = init.project;
    this.location = resolveLocation(init.location);
    this.googleAuth = new GoogleAuth(opts);
    this.apiEndpoint = init.apiEndpoint;
    this.preview = new VertexAIPreview(
      this.project,
      this.location,
      this.googleAuth,
      this.apiEndpoint
    );
  }

  /**
   * Gets the GenerativeModel class instance.
   *
   * This method creates a new instance of the `GenerativeModel` class with the
   * platform initialization parameters provided in {@link VertexInit} and model
   * initialization parameters provided in {@link ModelParams}. You can
   * optionally provide {@link RequestOptions} to override the default request
   * options.
   *
   * @example
   * ```
   * const project = 'your-cloud-project';
   * const location = 'us-central1';
   * const textModel =  'gemini-1.0-pro';
   * const visionModel = 'gemini-1.0-pro-vision';
   *
   * const vertexAI = new VertexAI({project: project, location: location});
   *
   * // Instantiate models
   * const generativeModel = vertexAI.getGenerativeModel({
   *   model: textModel,
   *   // The following parameters are optional
   *   // They can also be passed to individual content generation requests
   *   safetySettings: [{
   *                      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
   *                      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
   *                     }],
   *   generationConfig: {maxOutputTokens: 256},
   * });
   *
   * const generativeVisionModel = vertexAI.getGenerativeModel({
   *   model: visionModel,
   * });
   *
   * const generativeModelPreview = vertexAI.preview.getGenerativeModel({
   *   model: textModel,
   * });
   * ```
   *
   * @param modelParams - {@link ModelParams} Parameters to
   *     specify the generative model.
   * @param requestOptions - {@link RequestOptions} Parameters to specify
   *     request options
   * @returns Instance of the GenerativeModel class.
   */
  getGenerativeModel(
    modelParams: ModelParams,
    requestOptions?: RequestOptions
  ): GenerativeModel {
    const getGenerativeModelParams: GetGenerativeModelParams = {
      model: modelParams.model,
      project: this.project,
      location: this.location,
      googleAuth: this.googleAuth,
      apiEndpoint: this.apiEndpoint,
      safetySettings: modelParams.safetySettings,
      generationConfig: modelParams.generationConfig,
      tools: modelParams.tools,
      requestOptions: requestOptions,
      systemInstruction: modelParams.systemInstruction,
    };
    return new GenerativeModel(getGenerativeModelParams);
  }
}

/**
 * The preview namespace for VertexAI. Users invoke the `getGenerativeModel`
 * method to start using generative AI features that are in preview.
 */
class VertexAIPreview {
  private readonly project: string;
  private readonly location: string;
  private readonly googleAuth: GoogleAuth;
  private readonly apiEndpoint?: string;

  /**
   * @constructor
   * @param project - The Google Cloud project to use for the request
   * @param location - location The Google Cloud project location to use for the
   *     request
   * @param googleAuth - The GoogleAuthen class instance from
   *     google-auth-library.
   *        Complete list of authentication options is documented in the
   * GoogleAuthOptions interface:
   *        https://github.com/googleapis/google-auth-library-nodejs/blob/main/src/auth/googleauth.ts
   * @param apiEndpoint - [apiEndpoint] The base Vertex AI endpoint to use for
   *     the request. If
   *        not provided, the default regionalized endpoint
   *        (i.e. us-central1-aiplatform.googleapis.com) will be used.
   */
  constructor(
    project: string,
    location: string,
    googleAuth: GoogleAuth,
    apiEndpoint?: string
  ) {
    this.project = project;
    this.location = location;
    this.googleAuth = googleAuth;
    this.apiEndpoint = apiEndpoint;
  }

  /**
   * @param modelParams - {@link ModelParams} Parameters to
   *     specify the generative model.
   * @returns Instance of the GenerativeModelPreview class.
   */
  getGenerativeModel(
    modelParams: ModelParams,
    requestOptions?: RequestOptions
  ): GenerativeModelPreview {
    const getGenerativeModelParams: GetGenerativeModelParams = {
      model: modelParams.model,
      project: this.project,
      location: this.location,
      googleAuth: this.googleAuth,
      apiEndpoint: this.apiEndpoint,
      safetySettings: modelParams.safetySettings,
      generationConfig: modelParams.generationConfig,
      tools: modelParams.tools,
      requestOptions: requestOptions,
      systemInstruction: modelParams.systemInstruction,
    };
    return new GenerativeModelPreview(getGenerativeModelParams);
  }
}

function validateGoogleAuthOptions(
  project: string,
  googleAuthOptions?: GoogleAuthOptions
): GoogleAuthOptions {
  let opts: GoogleAuthOptions;
  const requiredScope = 'https://www.googleapis.com/auth/cloud-platform';
  if (!googleAuthOptions) {
    opts = {
      scopes: requiredScope,
    };
    return opts;
  }
  if (googleAuthOptions.projectId && googleAuthOptions.projectId !== project) {
    throw new Error(
      `inconsistent project ID values. argument project got value ${project} but googleAuthOptions.projectId got value ${googleAuthOptions.projectId}`
    );
  }
  opts = googleAuthOptions;
  if (!opts.scopes) {
    opts.scopes = requiredScope;
    return opts;
  }
  if (
    (typeof opts.scopes === 'string' && opts.scopes !== requiredScope) ||
    (Array.isArray(opts.scopes) && opts.scopes.indexOf(requiredScope) < 0)
  ) {
    throw new GoogleAuthError(
      `input GoogleAuthOptions.scopes ${opts.scopes} doesn't contain required scope ${requiredScope}, please include ${requiredScope} into GoogleAuthOptions.scopes or leave GoogleAuthOptions.scopes undefined`
    );
  }
  return opts;
}

function resolveLocation(locationFromInput?: string): string {
  if (locationFromInput) {
    return locationFromInput;
  }
  const inferredLocation =
    process.env['GOOGLE_CLOUD_REGION'] || process.env['CLOUD_ML_REGION'];
  if (inferredLocation) {
    return inferredLocation;
  }
  return 'us-central1';
}
