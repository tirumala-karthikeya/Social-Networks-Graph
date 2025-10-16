import { Response } from 'express';
import { IApiResponse } from '../types';

export class ApiResponse {
  static success<T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200): void {
    const response: IApiResponse<T> = {
      success: true,
      data,
      message
    };
    res.status(statusCode).json(response);
  }

  static error(res: Response, message: string, statusCode: number = 500, error?: any): void {
    const response: IApiResponse = {
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined
    };
    res.status(statusCode).json(response);
  }

  static validationError(res: Response, errors: any[]): void {
    const response: IApiResponse = {
      success: false,
      message: 'Validation error',
      error: errors.join(', ')
    };
    res.status(400).json(response);
  }

  static notFound(res: Response, resource: string = 'Resource'): void {
    const response: IApiResponse = {
      success: false,
      message: `${resource} not found`
    };
    res.status(404).json(response);
  }

  static conflict(res: Response, message: string): void {
    const response: IApiResponse = {
      success: false,
      message
    };
    res.status(409).json(response);
  }

  static forbidden(res: Response, message: string = 'Access forbidden'): void {
    const response: IApiResponse = {
      success: false,
      message
    };
    res.status(403).json(response);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): void {
    const response: IApiResponse = {
      success: false,
      message
    };
    res.status(401).json(response);
  }
}