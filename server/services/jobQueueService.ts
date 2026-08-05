export interface BackgroundJob {
  id: string;
  type: 'BULK_BENEFICIARY_IMPORT' | 'RECALCULATE_ANALYTICS' | 'GENERATE_REPORT_PDF';
  organizationId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  payload: any;
  result?: any;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export class BackgroundJobQueue {
  private static jobs: Map<string, BackgroundJob> = new Map();

  /**
   * Enqueues a background job for asynchronous execution.
   */
  public static enqueue(
    type: BackgroundJob['type'],
    organizationId: string,
    payload: any,
    processor: (payload: any) => Promise<any>
  ): BackgroundJob {
    const id = `JOB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const job: BackgroundJob = {
      id,
      type,
      organizationId,
      status: 'PENDING',
      payload,
      createdAt: new Date().toISOString()
    };

    this.jobs.set(id, job);

    // Asynchronous Execution Non-Blocking
    setImmediate(async () => {
      job.status = 'PROCESSING';
      try {
        const res = await processor(payload);
        job.status = 'COMPLETED';
        job.result = res;
        job.completedAt = new Date().toISOString();
      } catch (err: any) {
        job.status = 'FAILED';
        job.error = err.message;
      }
    });

    return job;
  }

  /**
   * Retrieves background job status.
   */
  public static getJob(id: string): BackgroundJob | undefined {
    return this.jobs.get(id);
  }
}
