"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IllegalArgumentError = exports.GoogleGenerativeAIError = exports.GoogleAuthError = exports.ClientErrorApi = exports.ClientError = void 0;
/**
 * GoogleAuthError is thrown when there is authentication issue with the request
 */
class GoogleAuthError extends Error {
    constructor(message, stackTrace = undefined) {
        super(message);
        this.stackTrace = undefined;
        this.message = constructErrorMessage('GoogleAuthError', message);
        this.name = 'GoogleAuthError';
        this.stackTrace = stackTrace;
    }
}
exports.GoogleAuthError = GoogleAuthError;
/**
 * ClientError is thrown when there is something wrong with the input.
 */
class ClientError extends Error {
    constructor(message) {
        super(message);
        this.message = constructErrorMessage('ClientError', message);
        this.name = 'ClientError';
    }
}
exports.ClientError = ClientError;
/**
 * ClientErrorApi is thrown when http 4XX status is received.
 * The [error object](https://cloud.google.com/apis/design/errors) can be found on the `apiError` property.
 * For details please refer to https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses
 */
class ClientErrorApi extends ClientError {
    constructor(message, apiError) {
        super(message);
        this.apiError = apiError;
    }
}
exports.ClientErrorApi = ClientErrorApi;
/**
 * GoogleGenerativeAIError is thrown when http response is not ok and status code is not 4XX
 * For details please refer to https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
class GoogleGenerativeAIError extends Error {
    constructor(message, stackTrace = undefined) {
        super(message);
        this.stackTrace = undefined;
        this.message = constructErrorMessage('GoogleGenerativeAIError', message);
        this.name = 'GoogleGenerativeAIError';
        this.stackTrace = stackTrace;
    }
}
exports.GoogleGenerativeAIError = GoogleGenerativeAIError;
/**
 * IllegalArgumentError is thrown when the request or operation is invalid
 */
class IllegalArgumentError extends Error {
    constructor(message, stackTrace = undefined) {
        super(message);
        this.stackTrace = undefined;
        this.message = constructErrorMessage('IllegalArgumentError', message);
        this.name = 'IllegalArgumentError';
        this.stackTrace = stackTrace;
    }
}
exports.IllegalArgumentError = IllegalArgumentError;
function constructErrorMessage(exceptionClass, message) {
    return `[VertexAI.${exceptionClass}]: ${message}`;
}
//# sourceMappingURL=errors.js.map