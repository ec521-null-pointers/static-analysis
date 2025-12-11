/**
 * Scheduler functions.
 *
 * @example
 * var schedulerLib = require('/lib/xp/scheduler');
 *
 * @module scheduler
 */
declare global {
    interface XpLibraries {
        '/lib/xp/scheduler': typeof import('./scheduler');
    }
}
import type { UserKey } from '@enonic-types/core';
export type { PrincipalKey, UserKey, GroupKey, RoleKey, ScriptValue } from '@enonic-types/core';
export declare type EditorFn<T> = (value: T) => T;
export interface CreateScheduledJobParams<Config extends Record<string, unknown>> {
    name: string;
    description?: string;
    descriptor: string;
    config?: Config;
    schedule: OneTimeSchedule | CronSchedule;
    user?: UserKey;
    enabled: boolean;
}
export interface OneTimeSchedule {
    type: 'ONE_TIME';
    value: string;
}
export interface CronSchedule {
    type: 'CRON';
    value: string;
    timeZone: string;
}
export interface ScheduledJob<Config extends Record<string, unknown> = Record<string, unknown>> {
    name: string;
    descriptor: string;
    description?: string | null;
    enabled: boolean;
    config?: Config | null;
    user?: UserKey | null;
    creator: UserKey;
    modifier: UserKey;
    createdTime: string;
    modifiedTime: string;
    lastRun?: string | null;
    lastTaskId?: string | null;
    schedule: OneTimeSchedule | CronSchedule;
}
/**
 * Creates a job to be scheduled.
 *
 * @example-ref examples/scheduler/create.js
 *
 * @param {object} params JSON with the parameters.
 * @param {string} params.name unique job name.
 * @param {string} [params.description] job description.
 * @param {string} params.descriptor descriptor of the task to be scheduled.
 * @param {object} [params.config] config of the task to be scheduled.
 * @param {object} params.schedule task time run config.
 * @param {string} params.schedule.value schedule value according to its type.
 * @param {string} params.schedule.type schedule type (CRON | ONE_TIME).
 * @param {string} params.schedule.timezone time zone of cron scheduling.
 * @param {string} [params.user] key of the user that submitted the task.
 * @param {boolean} params.enabled job is active or not.
 */
export declare function create<Config extends Record<string, unknown> = Record<string, unknown>>(params: CreateScheduledJobParams<Config>): ScheduledJob<Config>;
export interface ModifyScheduledJobParams<Config extends Record<string, unknown>> {
    name: string;
    editor: EditorFn<ScheduledJob<Config>>;
}
/**
 * Modifies scheduled job.
 *
 * @example-ref examples/scheduler/modify.js
 *
 * @param {object} params JSON with the parameters.
 * @param {string} params.name unique job name.
 * @param {function} params.editor editor callback function, has editable existing job as a param.
 */
export declare function modify<Config extends Record<string, unknown> = Record<string, unknown>>(params: ModifyScheduledJobParams<Config>): ScheduledJob<Config>;
export interface DeleteScheduledJobParams {
    name: string;
}
/**
 * Removes scheduled job.
 *
 * @example-ref examples/scheduler/delete.js
 *
 * @param {object} params JSON with the parameters.
 * @param {string} params.name job to be deleted name.
 */
declare function _delete(params: DeleteScheduledJobParams): boolean;
export { _delete as delete, };
export interface GetScheduledJobParams {
    name: string;
}
/**
 * Fetches scheduled job.
 *
 * @example-ref examples/scheduler/get.js
 *
 * @param {object} params JSON with the parameters.
 * @param {string} params.name job to be fetched name.
 */
export declare function get<Config extends Record<string, unknown> = Record<string, unknown>>(params: GetScheduledJobParams): ScheduledJob<Config> | null;
/**
 * Lists scheduled jobs.
 *
 * @example-ref examples/scheduler/list.js
 *
 */
export declare function list<Config extends Record<string, unknown> = Record<string, unknown>>(): ScheduledJob<Config>[];
