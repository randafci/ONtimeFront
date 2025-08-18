export interface ApiResponse<T> {
    statusCode: number;
    succeeded: boolean;
    message: string | null;
    code: {
        value: string;
        code: number;
    };
    errors: any;
    data: T;  // Generic type for the data
}