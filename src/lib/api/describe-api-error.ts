import type { AuraLabels } from '../../types/config.types';
import { DEFAULT_LABELS } from '../default-values.lib';

/** Token replaced by the HTTP status code in the status-based messages */
const STATUS_TOKEN = '{status}';

/** Lowest status code that still counts as a client error */
const CLIENT_ERROR_STATUS = 400;

/** Lowest status code that counts as a server error */
const SERVER_ERROR_STATUS = 500;

/** Above this there are no HTTP status codes */
const MAX_STATUS = 600;

/** Error codes axios reports for a request that ran out of time */
const TIMEOUT_CODES = ['ECONNABORTED', 'ETIMEDOUT'];

/** Error codes axios reports when the request never reached the server */
const NETWORK_CODES = ['ERR_NETWORK', 'ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET'];

/** The message axios gives a request that never reached the server */
const NETWORK_ERROR_MESSAGE = 'Network Error';

/** What kind of failure a rejected request was */
export type ApiFailureKind = 'network' | 'timeout' | 'client' | 'server' | 'unknown';

/** A rejected request, translated for the user and for the developer */
export interface ApiErrorDescription {
    /** The failure class the message was chosen by */
    kind: ApiFailureKind;
    /** User-facing text, overridable through `labels` */
    message: string;
    /** The raw error text — what the developer needs, verbatim */
    details: string;
    /** HTTP status, when the request got a response at all */
    status?: number;
    /** Transport-level error code (`ERR_NETWORK`, `ECONNABORTED`, …) */
    code?: string;
}

/**
 * The parts of an axios rejection this module reads.
 *
 * Duck-typed on purpose: `axios.isAxiosError` would mean a **value** import of
 * axios into a module that otherwise needs none, and every test that mocks
 * axios would have to keep that helper alive.
 */
interface AxiosErrorShape {
    message?: unknown;
    code?: unknown;
    response?: { status?: unknown };
}

/** Reads a rejection as an object, whatever it actually is */
const asErrorShape = (error: unknown): AxiosErrorShape =>
    typeof error === 'object' && error !== null ? (error as AxiosErrorShape) : {};

/** The HTTP status of the response, if there was one */
const readStatus = (error: AxiosErrorShape): number | undefined => {
    const status = error.response?.status;

    return typeof status === 'number' && status > 0 && status < MAX_STATUS ? status : undefined;
};

/** Classifies the failure — this is what picks the message */
const classify = (status: number | undefined, code: string, message: string): ApiFailureKind => {
    if (status !== undefined) {
        if (status >= SERVER_ERROR_STATUS) return 'server';
        if (status >= CLIENT_ERROR_STATUS) return 'client';

        // A 1xx/2xx/3xx that still rejected is not a status problem: something
        // downstream of the transport failed, so it is not described as one.
        return 'unknown';
    }

    if (TIMEOUT_CODES.includes(code)) return 'timeout';
    if (NETWORK_CODES.includes(code) || message === NETWORK_ERROR_MESSAGE) return 'network';

    return 'unknown';
};

/** The label keys the API failure messages live under */
type ApiErrorLabelKey =
    | 'apiErrorNetwork'
    | 'apiErrorTimeout'
    | 'apiErrorClient'
    | 'apiErrorServer'
    | 'apiErrorUnknown';

/** The label key each failure class takes its message from */
const LABEL_KEYS: Record<ApiFailureKind, ApiErrorLabelKey> = {
    network: 'apiErrorNetwork',
    timeout: 'apiErrorTimeout',
    client: 'apiErrorClient',
    server: 'apiErrorServer',
    unknown: 'apiErrorUnknown',
};

/**
 * Translates a rejected API request into what the user and the developer each
 * need to see.
 *
 * The raw axios message ("Request failed with status code 500", "Network
 * Error") is written by and for a developer: it is not localizable, and it
 * tells an end user nothing they can act on. So the **message** comes from
 * `labels` — overridable, translatable, chosen by failure class — and the raw
 * text is kept verbatim in **`details`**, where the developer still finds it.
 *
 * @param error - The rejection, as caught (any shape)
 * @param labels - The table's `labels` config; missing keys fall back to `DEFAULT_LABELS`
 * @returns The failure class with the texts belonging to it
 *
 * @example
 * ```typescript
 * describeApiError(axiosError, config.labels);
 * // { kind: 'server', message: 'The server ran into an error (500)…',
 * //   details: 'Request failed with status code 500', status: 500 }
 * ```
 */
export const describeApiError = (
    error: unknown,
    labels: Partial<AuraLabels> = {}
): ApiErrorDescription => {
    const shape = asErrorShape(error);

    const details = typeof shape.message === 'string' ? shape.message : String(error);
    const code = typeof shape.code === 'string' ? shape.code : undefined;
    const status = readStatus(shape);

    const kind = classify(status, code ?? '', details);
    const labelKey = LABEL_KEYS[kind];
    const template = labels[labelKey] ?? DEFAULT_LABELS[labelKey] ?? '';

    return {
        kind,
        message: template.replace(STATUS_TOKEN, status === undefined ? '' : String(status)),
        details,
        ...(status === undefined ? {} : { status }),
        ...(code === undefined ? {} : { code }),
    };
};
