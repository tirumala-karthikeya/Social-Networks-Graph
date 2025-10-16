import Joi from 'joi';
import { IUserInput, IUserUpdate, IRelationship } from '../types';

// User creation validation schema
export const createUserSchema = Joi.object<IUserInput>({
  username: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Username is required',
      'string.min': 'Username must be at least 2 characters long',
      'string.max': 'Username cannot exceed 50 characters',
      'any.required': 'Username is required'
    }),
  age: Joi.number()
    .integer()
    .min(13)
    .max(120)
    .required()
    .messages({
      'number.base': 'Age must be a number',
      'number.integer': 'Age must be an integer',
      'number.min': 'Age must be at least 13',
      'number.max': 'Age cannot exceed 120',
      'any.required': 'Age is required'
    }),
  hobbies: Joi.array()
    .items(
      Joi.string()
        .trim()
        .min(1)
        .max(100)
        .messages({
          'string.empty': 'Hobby cannot be empty',
          'string.min': 'Hobby must be at least 1 character long',
          'string.max': 'Hobby cannot exceed 100 characters'
        })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one hobby is required',
      'any.required': 'Hobbies are required'
    })
});

// User update validation schema
export const updateUserSchema = Joi.object<IUserUpdate>({
  username: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Username must be at least 2 characters long',
      'string.max': 'Username cannot exceed 50 characters'
    }),
  age: Joi.number()
    .integer()
    .min(13)
    .max(120)
    .optional()
    .messages({
      'number.base': 'Age must be a number',
      'number.integer': 'Age must be an integer',
      'number.min': 'Age must be at least 13',
      'number.max': 'Age cannot exceed 120'
    }),
  hobbies: Joi.array()
    .items(
      Joi.string()
        .trim()
        .min(1)
        .max(100)
        .messages({
          'string.empty': 'Hobby cannot be empty',
          'string.min': 'Hobby must be at least 1 character long',
          'string.max': 'Hobby cannot exceed 100 characters'
        })
    )
    .min(1)
    .optional()
    .messages({
      'array.min': 'At least one hobby is required'
    })
});

// Relationship validation schema
export const relationshipSchema = Joi.object<IRelationship>({
  friendId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Friend ID is required',
      'any.required': 'Friend ID is required'
    })
});

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    req.body = value;
    next();
  };
};

// Validate MongoDB ObjectId
export const validateObjectId = (req: any, res: any, next: any) => {
  const { id } = req.params;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID'
    });
  }

  next();
};

// Validate UUID format
export const validateUUID = (req: any, res: any, next: any) => {
  const { id } = req.params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID format'
    });
  }

  next();
};