import { z } from 'zod';
import type { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UserScalarFieldEnumSchema = z.enum(['id','username','email','password','firstName','lastName','role','institution','createdAt','updatedAt']);

export const ProjectScalarFieldEnumSchema = z.enum(['id','title','description','category','visibility','status','techStack','githubUrl','demoUrl','ownerId','createdAt','updatedAt']);

export const ProjectCollaboratorScalarFieldEnumSchema = z.enum(['id','projectId','userId','addedAt']);

export const ProjectStarScalarFieldEnumSchema = z.enum(['id','projectId','userId','createdAt']);

export const CommentScalarFieldEnumSchema = z.enum(['id','projectId','userId','content','createdAt']);

export const FacultyAssignmentScalarFieldEnumSchema = z.enum(['id','projectId','facultyId','assignedAt','reviewStatus','grade','feedback','reviewedAt']);

export const ProjectFileScalarFieldEnumSchema = z.enum(['id','projectId','fileName','filePath','fileSize','uploadedAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const RoleSchema = z.enum(['STUDENT','FACULTY','ADMIN']);

export type RoleType = `${z.infer<typeof RoleSchema>}`

export const VisibilitySchema = z.enum(['PRIVATE','INSTITUTION','PUBLIC']);

export type VisibilityType = `${z.infer<typeof VisibilitySchema>}`

export const ProjectStatusSchema = z.enum(['DRAFT','SUBMITTED','UNDER_REVIEW','APPROVED']);

export type ProjectStatusType = `${z.infer<typeof ProjectStatusSchema>}`

export const ReviewStatusSchema = z.enum(['PENDING','COMPLETED']);

export type ReviewStatusType = `${z.infer<typeof ReviewStatusSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  role: RoleSchema,
  id: z.string().cuid(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  institution: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// PROJECT SCHEMA
/////////////////////////////////////////

export const ProjectSchema = z.object({
  visibility: VisibilitySchema,
  status: ProjectStatusSchema,
  id: z.string().cuid(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  techStack: z.string().array(),
  githubUrl: z.string().nullable(),
  demoUrl: z.string().nullable(),
  ownerId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Project = z.infer<typeof ProjectSchema>

/////////////////////////////////////////
// PROJECT COLLABORATOR SCHEMA
/////////////////////////////////////////

export const ProjectCollaboratorSchema = z.object({
  id: z.string().cuid(),
  projectId: z.string(),
  userId: z.string(),
  addedAt: z.coerce.date(),
})

export type ProjectCollaborator = z.infer<typeof ProjectCollaboratorSchema>

/////////////////////////////////////////
// PROJECT STAR SCHEMA
/////////////////////////////////////////

export const ProjectStarSchema = z.object({
  id: z.string().cuid(),
  projectId: z.string(),
  userId: z.string(),
  createdAt: z.coerce.date(),
})

export type ProjectStar = z.infer<typeof ProjectStarSchema>

/////////////////////////////////////////
// COMMENT SCHEMA
/////////////////////////////////////////

export const CommentSchema = z.object({
  id: z.string().cuid(),
  projectId: z.string(),
  userId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date(),
})

export type Comment = z.infer<typeof CommentSchema>

/////////////////////////////////////////
// FACULTY ASSIGNMENT SCHEMA
/////////////////////////////////////////

export const FacultyAssignmentSchema = z.object({
  reviewStatus: ReviewStatusSchema,
  id: z.string().cuid(),
  projectId: z.string(),
  facultyId: z.string(),
  assignedAt: z.coerce.date(),
  grade: z.string().nullable(),
  feedback: z.string().nullable(),
  reviewedAt: z.coerce.date().nullable(),
})

export type FacultyAssignment = z.infer<typeof FacultyAssignmentSchema>

/////////////////////////////////////////
// PROJECT FILE SCHEMA
/////////////////////////////////////////

export const ProjectFileSchema = z.object({
  id: z.string().cuid(),
  projectId: z.string(),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number().int(),
  uploadedAt: z.coerce.date(),
})

export type ProjectFile = z.infer<typeof ProjectFileSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// USER
//------------------------------------------------------

export const UserIncludeSchema: z.ZodType<Prisma.UserInclude> = z.object({
  projects: z.union([z.boolean(),z.lazy(() => ProjectFindManyArgsSchema)]).optional(),
  comments: z.union([z.boolean(),z.lazy(() => CommentFindManyArgsSchema)]).optional(),
  collaborations: z.union([z.boolean(),z.lazy(() => ProjectCollaboratorFindManyArgsSchema)]).optional(),
  stars: z.union([z.boolean(),z.lazy(() => ProjectStarFindManyArgsSchema)]).optional(),
  facultyAssignments: z.union([z.boolean(),z.lazy(() => FacultyAssignmentFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const UserArgsSchema: z.ZodType<Prisma.UserDefaultArgs> = z.object({
  select: z.lazy(() => UserSelectSchema).optional(),
  include: z.lazy(() => UserIncludeSchema).optional(),
}).strict();

export const UserCountOutputTypeArgsSchema: z.ZodType<Prisma.UserCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => UserCountOutputTypeSelectSchema).nullish(),
}).strict();

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z.object({
  projects: z.boolean().optional(),
  comments: z.boolean().optional(),
  collaborations: z.boolean().optional(),
  stars: z.boolean().optional(),
  facultyAssignments: z.boolean().optional(),
}).strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  id: z.boolean().optional(),
  username: z.boolean().optional(),
  email: z.boolean().optional(),
  password: z.boolean().optional(),
  firstName: z.boolean().optional(),
  lastName: z.boolean().optional(),
  role: z.boolean().optional(),
  institution: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  projects: z.union([z.boolean(),z.lazy(() => ProjectFindManyArgsSchema)]).optional(),
  comments: z.union([z.boolean(),z.lazy(() => CommentFindManyArgsSchema)]).optional(),
  collaborations: z.union([z.boolean(),z.lazy(() => ProjectCollaboratorFindManyArgsSchema)]).optional(),
  stars: z.union([z.boolean(),z.lazy(() => ProjectStarFindManyArgsSchema)]).optional(),
  facultyAssignments: z.union([z.boolean(),z.lazy(() => FacultyAssignmentFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

// PROJECT
//------------------------------------------------------

export const ProjectIncludeSchema: z.ZodType<Prisma.ProjectInclude> = z.object({
  owner: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  collaborators: z.union([z.boolean(),z.lazy(() => ProjectCollaboratorFindManyArgsSchema)]).optional(),
  comments: z.union([z.boolean(),z.lazy(() => CommentFindManyArgsSchema)]).optional(),
  stars: z.union([z.boolean(),z.lazy(() => ProjectStarFindManyArgsSchema)]).optional(),
  facultyAssignments: z.union([z.boolean(),z.lazy(() => FacultyAssignmentFindManyArgsSchema)]).optional(),
  files: z.union([z.boolean(),z.lazy(() => ProjectFileFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ProjectCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const ProjectArgsSchema: z.ZodType<Prisma.ProjectDefaultArgs> = z.object({
  select: z.lazy(() => ProjectSelectSchema).optional(),
  include: z.lazy(() => ProjectIncludeSchema).optional(),
}).strict();

export const ProjectCountOutputTypeArgsSchema: z.ZodType<Prisma.ProjectCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => ProjectCountOutputTypeSelectSchema).nullish(),
}).strict();

export const ProjectCountOutputTypeSelectSchema: z.ZodType<Prisma.ProjectCountOutputTypeSelect> = z.object({
  collaborators: z.boolean().optional(),
  comments: z.boolean().optional(),
  stars: z.boolean().optional(),
  facultyAssignments: z.boolean().optional(),
  files: z.boolean().optional(),
}).strict();

export const ProjectSelectSchema: z.ZodType<Prisma.ProjectSelect> = z.object({
  id: z.boolean().optional(),
  title: z.boolean().optional(),
  description: z.boolean().optional(),
  category: z.boolean().optional(),
  visibility: z.boolean().optional(),
  status: z.boolean().optional(),
  techStack: z.boolean().optional(),
  githubUrl: z.boolean().optional(),
  demoUrl: z.boolean().optional(),
  ownerId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  owner: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  collaborators: z.union([z.boolean(),z.lazy(() => ProjectCollaboratorFindManyArgsSchema)]).optional(),
  comments: z.union([z.boolean(),z.lazy(() => CommentFindManyArgsSchema)]).optional(),
  stars: z.union([z.boolean(),z.lazy(() => ProjectStarFindManyArgsSchema)]).optional(),
  facultyAssignments: z.union([z.boolean(),z.lazy(() => FacultyAssignmentFindManyArgsSchema)]).optional(),
  files: z.union([z.boolean(),z.lazy(() => ProjectFileFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ProjectCountOutputTypeArgsSchema)]).optional(),
}).strict()

// PROJECT COLLABORATOR
//------------------------------------------------------

export const ProjectCollaboratorIncludeSchema: z.ZodType<Prisma.ProjectCollaboratorInclude> = z.object({
  project: z.union([z.boolean(),z.lazy(() => ProjectArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const ProjectCollaboratorArgsSchema: z.ZodType<Prisma.ProjectCollaboratorDefaultArgs> = z.object({
  select: z.lazy(() => ProjectCollaboratorSelectSchema).optional(),
  include: z.lazy(() => ProjectCollaboratorIncludeSchema).optional(),
}).strict();

export const ProjectCollaboratorSelectSchema: z.ZodType<Prisma.ProjectCollaboratorSelect> = z.object({
  id: z.boolean().optional(),
  projectId: z.boolean().optional(),
  userId: z.boolean().optional(),
  addedAt: z.boolean().optional(),
  project: z.union([z.boolean(),z.lazy(() => ProjectArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// PROJECT STAR
//------------------------------------------------------

export const ProjectStarIncludeSchema: z.ZodType<Prisma.ProjectStarInclude> = z.object({
  project: z.union([z.boolean(),z.lazy(() => ProjectArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const ProjectStarArgsSchema: z.ZodType<Prisma.ProjectStarDefaultArgs> = z.object({
  select: z.lazy(() => ProjectStarSelectSchema).optional(),
  include: z.lazy(() => ProjectStarIncludeSchema).optional(),
}).strict();

export const ProjectStarSelectSchema: z.ZodType<Prisma.ProjectStarSelect> = z.object({
  id: z.boolean().optional(),
  projectId: z.boolean().optional(),
  userId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  project: z.union([z.boolean(),z.lazy(() => ProjectArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// COMMENT
//------------------------------------------------------

export const CommentIncludeSchema: z.ZodType<Prisma.CommentInclude> = z.object({
  project: z.union([z.boolean(),z.lazy(() => ProjectArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const CommentArgsSchema: z.ZodType<Prisma.CommentDefaultArgs> = z.object({
  select: z.lazy(() => CommentSelectSchema).optional(),
  include: z.lazy(() => CommentIncludeSchema).optional(),
}).strict();

export const CommentSelectSchema: z.ZodType<Prisma.CommentSelect> = z.object({
  id: z.boolean().optional(),
  projectId: z.boolean().optional(),
  userId: z.boolean().optional(),
  content: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  project: z.union([z.boolean(),z.lazy(() => ProjectArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// FACULTY ASSIGNMENT
//------------------------------------------------------

export const FacultyAssignmentIncludeSchema: z.ZodType<Prisma.FacultyAssignmentInclude> = z.object({
  project: z.union([z.boolean(),z.lazy(() => ProjectArgsSchema)]).optional(),
  faculty: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const FacultyAssignmentArgsSchema: z.ZodType<Prisma.FacultyAssignmentDefaultArgs> = z.object({
  select: z.lazy(() => FacultyAssignmentSelectSchema).optional(),
  include: z.lazy(() => FacultyAssignmentIncludeSchema).optional(),
}).strict();

export const FacultyAssignmentSelectSchema: z.ZodType<Prisma.FacultyAssignmentSelect> = z.object({
  id: z.boolean().optional(),
  projectId: z.boolean().optional(),
  facultyId: z.boolean().optional(),
  assignedAt: z.boolean().optional(),
  reviewStatus: z.boolean().optional(),
  grade: z.boolean().optional(),
  feedback: z.boolean().optional(),
  reviewedAt: z.boolean().optional(),
  project: z.union([z.boolean(),z.lazy(() => ProjectArgsSchema)]).optional(),
  faculty: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// PROJECT FILE
//------------------------------------------------------

export const ProjectFileIncludeSchema: z.ZodType<Prisma.ProjectFileInclude> = z.object({
  project: z.union([z.boolean(),z.lazy(() => ProjectArgsSchema)]).optional(),
}).strict()

export const ProjectFileArgsSchema: z.ZodType<Prisma.ProjectFileDefaultArgs> = z.object({
  select: z.lazy(() => ProjectFileSelectSchema).optional(),
  include: z.lazy(() => ProjectFileIncludeSchema).optional(),
}).strict();

export const ProjectFileSelectSchema: z.ZodType<Prisma.ProjectFileSelect> = z.object({
  id: z.boolean().optional(),
  projectId: z.boolean().optional(),
  fileName: z.boolean().optional(),
  filePath: z.boolean().optional(),
  fileSize: z.boolean().optional(),
  uploadedAt: z.boolean().optional(),
  project: z.union([z.boolean(),z.lazy(() => ProjectArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  username: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  password: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  firstName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  lastName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  role: z.union([ z.lazy(() => EnumRoleFilterSchema),z.lazy(() => RoleSchema) ]).optional(),
  institution: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  projects: z.lazy(() => ProjectListRelationFilterSchema).optional(),
  comments: z.lazy(() => CommentListRelationFilterSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorListRelationFilterSchema).optional(),
  stars: z.lazy(() => ProjectStarListRelationFilterSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentListRelationFilterSchema).optional()
}).strict();

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  institution: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  projects: z.lazy(() => ProjectOrderByRelationAggregateInputSchema).optional(),
  comments: z.lazy(() => CommentOrderByRelationAggregateInputSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorOrderByRelationAggregateInputSchema).optional(),
  stars: z.lazy(() => ProjectStarOrderByRelationAggregateInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentOrderByRelationAggregateInputSchema).optional()
}).strict();

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    username: z.string(),
    email: z.string()
  }),
  z.object({
    id: z.string().cuid(),
    username: z.string(),
  }),
  z.object({
    id: z.string().cuid(),
    email: z.string(),
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    username: z.string(),
    email: z.string(),
  }),
  z.object({
    username: z.string(),
  }),
  z.object({
    email: z.string(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  username: z.string().optional(),
  email: z.string().optional(),
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  password: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  firstName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  lastName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  role: z.union([ z.lazy(() => EnumRoleFilterSchema),z.lazy(() => RoleSchema) ]).optional(),
  institution: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  projects: z.lazy(() => ProjectListRelationFilterSchema).optional(),
  comments: z.lazy(() => CommentListRelationFilterSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorListRelationFilterSchema).optional(),
  stars: z.lazy(() => ProjectStarListRelationFilterSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentListRelationFilterSchema).optional()
}).strict());

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  institution: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional()
}).strict();

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  username: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  password: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  firstName: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  lastName: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  role: z.union([ z.lazy(() => EnumRoleWithAggregatesFilterSchema),z.lazy(() => RoleSchema) ]).optional(),
  institution: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const ProjectWhereInputSchema: z.ZodType<Prisma.ProjectWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ProjectWhereInputSchema),z.lazy(() => ProjectWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProjectWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProjectWhereInputSchema),z.lazy(() => ProjectWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  category: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  visibility: z.union([ z.lazy(() => EnumVisibilityFilterSchema),z.lazy(() => VisibilitySchema) ]).optional(),
  status: z.union([ z.lazy(() => EnumProjectStatusFilterSchema),z.lazy(() => ProjectStatusSchema) ]).optional(),
  techStack: z.lazy(() => StringNullableListFilterSchema).optional(),
  githubUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  demoUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  ownerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  owner: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  collaborators: z.lazy(() => ProjectCollaboratorListRelationFilterSchema).optional(),
  comments: z.lazy(() => CommentListRelationFilterSchema).optional(),
  stars: z.lazy(() => ProjectStarListRelationFilterSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentListRelationFilterSchema).optional(),
  files: z.lazy(() => ProjectFileListRelationFilterSchema).optional()
}).strict();

export const ProjectOrderByWithRelationInputSchema: z.ZodType<Prisma.ProjectOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  category: z.lazy(() => SortOrderSchema).optional(),
  visibility: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  techStack: z.lazy(() => SortOrderSchema).optional(),
  githubUrl: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  demoUrl: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  owner: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  collaborators: z.lazy(() => ProjectCollaboratorOrderByRelationAggregateInputSchema).optional(),
  comments: z.lazy(() => CommentOrderByRelationAggregateInputSchema).optional(),
  stars: z.lazy(() => ProjectStarOrderByRelationAggregateInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentOrderByRelationAggregateInputSchema).optional(),
  files: z.lazy(() => ProjectFileOrderByRelationAggregateInputSchema).optional()
}).strict();

export const ProjectWhereUniqueInputSchema: z.ZodType<Prisma.ProjectWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => ProjectWhereInputSchema),z.lazy(() => ProjectWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProjectWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProjectWhereInputSchema),z.lazy(() => ProjectWhereInputSchema).array() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  category: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  visibility: z.union([ z.lazy(() => EnumVisibilityFilterSchema),z.lazy(() => VisibilitySchema) ]).optional(),
  status: z.union([ z.lazy(() => EnumProjectStatusFilterSchema),z.lazy(() => ProjectStatusSchema) ]).optional(),
  techStack: z.lazy(() => StringNullableListFilterSchema).optional(),
  githubUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  demoUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  ownerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  owner: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  collaborators: z.lazy(() => ProjectCollaboratorListRelationFilterSchema).optional(),
  comments: z.lazy(() => CommentListRelationFilterSchema).optional(),
  stars: z.lazy(() => ProjectStarListRelationFilterSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentListRelationFilterSchema).optional(),
  files: z.lazy(() => ProjectFileListRelationFilterSchema).optional()
}).strict());

export const ProjectOrderByWithAggregationInputSchema: z.ZodType<Prisma.ProjectOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  category: z.lazy(() => SortOrderSchema).optional(),
  visibility: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  techStack: z.lazy(() => SortOrderSchema).optional(),
  githubUrl: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  demoUrl: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ProjectCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ProjectMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ProjectMinOrderByAggregateInputSchema).optional()
}).strict();

export const ProjectScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ProjectScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ProjectScalarWhereWithAggregatesInputSchema),z.lazy(() => ProjectScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProjectScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProjectScalarWhereWithAggregatesInputSchema),z.lazy(() => ProjectScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  title: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  category: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  visibility: z.union([ z.lazy(() => EnumVisibilityWithAggregatesFilterSchema),z.lazy(() => VisibilitySchema) ]).optional(),
  status: z.union([ z.lazy(() => EnumProjectStatusWithAggregatesFilterSchema),z.lazy(() => ProjectStatusSchema) ]).optional(),
  techStack: z.lazy(() => StringNullableListFilterSchema).optional(),
  githubUrl: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  demoUrl: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  ownerId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const ProjectCollaboratorWhereInputSchema: z.ZodType<Prisma.ProjectCollaboratorWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ProjectCollaboratorWhereInputSchema),z.lazy(() => ProjectCollaboratorWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProjectCollaboratorWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProjectCollaboratorWhereInputSchema),z.lazy(() => ProjectCollaboratorWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  projectId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  addedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  project: z.union([ z.lazy(() => ProjectScalarRelationFilterSchema),z.lazy(() => ProjectWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const ProjectCollaboratorOrderByWithRelationInputSchema: z.ZodType<Prisma.ProjectCollaboratorOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  addedAt: z.lazy(() => SortOrderSchema).optional(),
  project: z.lazy(() => ProjectOrderByWithRelationInputSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const ProjectCollaboratorWhereUniqueInputSchema: z.ZodType<Prisma.ProjectCollaboratorWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    projectId_userId: z.lazy(() => ProjectCollaboratorProjectIdUserIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    projectId_userId: z.lazy(() => ProjectCollaboratorProjectIdUserIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  projectId_userId: z.lazy(() => ProjectCollaboratorProjectIdUserIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => ProjectCollaboratorWhereInputSchema),z.lazy(() => ProjectCollaboratorWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProjectCollaboratorWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProjectCollaboratorWhereInputSchema),z.lazy(() => ProjectCollaboratorWhereInputSchema).array() ]).optional(),
  projectId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  addedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  project: z.union([ z.lazy(() => ProjectScalarRelationFilterSchema),z.lazy(() => ProjectWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const ProjectCollaboratorOrderByWithAggregationInputSchema: z.ZodType<Prisma.ProjectCollaboratorOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  addedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ProjectCollaboratorCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ProjectCollaboratorMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ProjectCollaboratorMinOrderByAggregateInputSchema).optional()
}).strict();

export const ProjectCollaboratorScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ProjectCollaboratorScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ProjectCollaboratorScalarWhereWithAggregatesInputSchema),z.lazy(() => ProjectCollaboratorScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProjectCollaboratorScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProjectCollaboratorScalarWhereWithAggregatesInputSchema),z.lazy(() => ProjectCollaboratorScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  projectId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  addedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const ProjectStarWhereInputSchema: z.ZodType<Prisma.ProjectStarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ProjectStarWhereInputSchema),z.lazy(() => ProjectStarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProjectStarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProjectStarWhereInputSchema),z.lazy(() => ProjectStarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  projectId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  project: z.union([ z.lazy(() => ProjectScalarRelationFilterSchema),z.lazy(() => ProjectWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const ProjectStarOrderByWithRelationInputSchema: z.ZodType<Prisma.ProjectStarOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  project: z.lazy(() => ProjectOrderByWithRelationInputSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const ProjectStarWhereUniqueInputSchema: z.ZodType<Prisma.ProjectStarWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    projectId_userId: z.lazy(() => ProjectStarProjectIdUserIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    projectId_userId: z.lazy(() => ProjectStarProjectIdUserIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  projectId_userId: z.lazy(() => ProjectStarProjectIdUserIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => ProjectStarWhereInputSchema),z.lazy(() => ProjectStarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProjectStarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProjectStarWhereInputSchema),z.lazy(() => ProjectStarWhereInputSchema).array() ]).optional(),
  projectId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  project: z.union([ z.lazy(() => ProjectScalarRelationFilterSchema),z.lazy(() => ProjectWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const ProjectStarOrderByWithAggregationInputSchema: z.ZodType<Prisma.ProjectStarOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ProjectStarCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ProjectStarMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ProjectStarMinOrderByAggregateInputSchema).optional()
}).strict();

export const ProjectStarScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ProjectStarScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ProjectStarScalarWhereWithAggregatesInputSchema),z.lazy(() => ProjectStarScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProjectStarScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProjectStarScalarWhereWithAggregatesInputSchema),z.lazy(() => ProjectStarScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  projectId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const CommentWhereInputSchema: z.ZodType<Prisma.CommentWhereInput> = z.object({
  AND: z.union([ z.lazy(() => CommentWhereInputSchema),z.lazy(() => CommentWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CommentWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CommentWhereInputSchema),z.lazy(() => CommentWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  projectId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  project: z.union([ z.lazy(() => ProjectScalarRelationFilterSchema),z.lazy(() => ProjectWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const CommentOrderByWithRelationInputSchema: z.ZodType<Prisma.CommentOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  project: z.lazy(() => ProjectOrderByWithRelationInputSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const CommentWhereUniqueInputSchema: z.ZodType<Prisma.CommentWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => CommentWhereInputSchema),z.lazy(() => CommentWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CommentWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CommentWhereInputSchema),z.lazy(() => CommentWhereInputSchema).array() ]).optional(),
  projectId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  project: z.union([ z.lazy(() => ProjectScalarRelationFilterSchema),z.lazy(() => ProjectWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const CommentOrderByWithAggregationInputSchema: z.ZodType<Prisma.CommentOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => CommentCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => CommentMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => CommentMinOrderByAggregateInputSchema).optional()
}).strict();

export const CommentScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CommentScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => CommentScalarWhereWithAggregatesInputSchema),z.lazy(() => CommentScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => CommentScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CommentScalarWhereWithAggregatesInputSchema),z.lazy(() => CommentScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  projectId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const FacultyAssignmentWhereInputSchema: z.ZodType<Prisma.FacultyAssignmentWhereInput> = z.object({
  AND: z.union([ z.lazy(() => FacultyAssignmentWhereInputSchema),z.lazy(() => FacultyAssignmentWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FacultyAssignmentWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FacultyAssignmentWhereInputSchema),z.lazy(() => FacultyAssignmentWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  projectId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  facultyId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  assignedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  reviewStatus: z.union([ z.lazy(() => EnumReviewStatusFilterSchema),z.lazy(() => ReviewStatusSchema) ]).optional(),
  grade: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  feedback: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  reviewedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  project: z.union([ z.lazy(() => ProjectScalarRelationFilterSchema),z.lazy(() => ProjectWhereInputSchema) ]).optional(),
  faculty: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const FacultyAssignmentOrderByWithRelationInputSchema: z.ZodType<Prisma.FacultyAssignmentOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  facultyId: z.lazy(() => SortOrderSchema).optional(),
  assignedAt: z.lazy(() => SortOrderSchema).optional(),
  reviewStatus: z.lazy(() => SortOrderSchema).optional(),
  grade: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  feedback: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  reviewedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  project: z.lazy(() => ProjectOrderByWithRelationInputSchema).optional(),
  faculty: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const FacultyAssignmentWhereUniqueInputSchema: z.ZodType<Prisma.FacultyAssignmentWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => FacultyAssignmentWhereInputSchema),z.lazy(() => FacultyAssignmentWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FacultyAssignmentWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FacultyAssignmentWhereInputSchema),z.lazy(() => FacultyAssignmentWhereInputSchema).array() ]).optional(),
  projectId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  facultyId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  assignedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  reviewStatus: z.union([ z.lazy(() => EnumReviewStatusFilterSchema),z.lazy(() => ReviewStatusSchema) ]).optional(),
  grade: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  feedback: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  reviewedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  project: z.union([ z.lazy(() => ProjectScalarRelationFilterSchema),z.lazy(() => ProjectWhereInputSchema) ]).optional(),
  faculty: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const FacultyAssignmentOrderByWithAggregationInputSchema: z.ZodType<Prisma.FacultyAssignmentOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  facultyId: z.lazy(() => SortOrderSchema).optional(),
  assignedAt: z.lazy(() => SortOrderSchema).optional(),
  reviewStatus: z.lazy(() => SortOrderSchema).optional(),
  grade: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  feedback: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  reviewedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => FacultyAssignmentCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => FacultyAssignmentMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => FacultyAssignmentMinOrderByAggregateInputSchema).optional()
}).strict();

export const FacultyAssignmentScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.FacultyAssignmentScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => FacultyAssignmentScalarWhereWithAggregatesInputSchema),z.lazy(() => FacultyAssignmentScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => FacultyAssignmentScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FacultyAssignmentScalarWhereWithAggregatesInputSchema),z.lazy(() => FacultyAssignmentScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  projectId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  facultyId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  assignedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  reviewStatus: z.union([ z.lazy(() => EnumReviewStatusWithAggregatesFilterSchema),z.lazy(() => ReviewStatusSchema) ]).optional(),
  grade: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  feedback: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  reviewedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
}).strict();

export const ProjectFileWhereInputSchema: z.ZodType<Prisma.ProjectFileWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ProjectFileWhereInputSchema),z.lazy(() => ProjectFileWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProjectFileWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProjectFileWhereInputSchema),z.lazy(() => ProjectFileWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  projectId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  fileName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  filePath: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  fileSize: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  uploadedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  project: z.union([ z.lazy(() => ProjectScalarRelationFilterSchema),z.lazy(() => ProjectWhereInputSchema) ]).optional(),
}).strict();

export const ProjectFileOrderByWithRelationInputSchema: z.ZodType<Prisma.ProjectFileOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  fileName: z.lazy(() => SortOrderSchema).optional(),
  filePath: z.lazy(() => SortOrderSchema).optional(),
  fileSize: z.lazy(() => SortOrderSchema).optional(),
  uploadedAt: z.lazy(() => SortOrderSchema).optional(),
  project: z.lazy(() => ProjectOrderByWithRelationInputSchema).optional()
}).strict();

export const ProjectFileWhereUniqueInputSchema: z.ZodType<Prisma.ProjectFileWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => ProjectFileWhereInputSchema),z.lazy(() => ProjectFileWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProjectFileWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProjectFileWhereInputSchema),z.lazy(() => ProjectFileWhereInputSchema).array() ]).optional(),
  projectId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  fileName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  filePath: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  fileSize: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  uploadedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  project: z.union([ z.lazy(() => ProjectScalarRelationFilterSchema),z.lazy(() => ProjectWhereInputSchema) ]).optional(),
}).strict());

export const ProjectFileOrderByWithAggregationInputSchema: z.ZodType<Prisma.ProjectFileOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  fileName: z.lazy(() => SortOrderSchema).optional(),
  filePath: z.lazy(() => SortOrderSchema).optional(),
  fileSize: z.lazy(() => SortOrderSchema).optional(),
  uploadedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ProjectFileCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ProjectFileAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ProjectFileMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ProjectFileMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ProjectFileSumOrderByAggregateInputSchema).optional()
}).strict();

export const ProjectFileScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ProjectFileScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ProjectFileScalarWhereWithAggregatesInputSchema),z.lazy(() => ProjectFileScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProjectFileScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProjectFileScalarWhereWithAggregatesInputSchema),z.lazy(() => ProjectFileScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  projectId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  fileName: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  filePath: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  fileSize: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  uploadedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z.object({
  id: z.string().cuid().optional(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.lazy(() => RoleSchema),
  institution: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  projects: z.lazy(() => ProjectCreateNestedManyWithoutOwnerInputSchema).optional(),
  comments: z.lazy(() => CommentCreateNestedManyWithoutUserInputSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorCreateNestedManyWithoutUserInputSchema).optional(),
  stars: z.lazy(() => ProjectStarCreateNestedManyWithoutUserInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentCreateNestedManyWithoutFacultyInputSchema).optional()
}).strict();

export const UserUncheckedCreateInputSchema: z.ZodType<Prisma.UserUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.lazy(() => RoleSchema),
  institution: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  projects: z.lazy(() => ProjectUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedCreateNestedManyWithoutFacultyInputSchema).optional()
}).strict();

export const UserUpdateInputSchema: z.ZodType<Prisma.UserUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  institution: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  projects: z.lazy(() => ProjectUpdateManyWithoutOwnerNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUpdateManyWithoutUserNestedInputSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorUpdateManyWithoutUserNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUpdateManyWithoutUserNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUpdateManyWithoutFacultyNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  institution: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  projects: z.lazy(() => ProjectUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedUpdateManyWithoutFacultyNestedInputSchema).optional()
}).strict();

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.lazy(() => RoleSchema),
  institution: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserUpdateManyMutationInputSchema: z.ZodType<Prisma.UserUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  institution: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  institution: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProjectCreateInputSchema: z.ZodType<Prisma.ProjectCreateInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  visibility: z.lazy(() => VisibilitySchema),
  status: z.lazy(() => ProjectStatusSchema),
  techStack: z.union([ z.lazy(() => ProjectCreatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.string().optional().nullable(),
  demoUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  owner: z.lazy(() => UserCreateNestedOneWithoutProjectsInputSchema),
  collaborators: z.lazy(() => ProjectCollaboratorCreateNestedManyWithoutProjectInputSchema).optional(),
  comments: z.lazy(() => CommentCreateNestedManyWithoutProjectInputSchema).optional(),
  stars: z.lazy(() => ProjectStarCreateNestedManyWithoutProjectInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentCreateNestedManyWithoutProjectInputSchema).optional(),
  files: z.lazy(() => ProjectFileCreateNestedManyWithoutProjectInputSchema).optional()
}).strict();

export const ProjectUncheckedCreateInputSchema: z.ZodType<Prisma.ProjectUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  visibility: z.lazy(() => VisibilitySchema),
  status: z.lazy(() => ProjectStatusSchema),
  techStack: z.union([ z.lazy(() => ProjectCreatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.string().optional().nullable(),
  demoUrl: z.string().optional().nullable(),
  ownerId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  collaborators: z.lazy(() => ProjectCollaboratorUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  files: z.lazy(() => ProjectFileUncheckedCreateNestedManyWithoutProjectInputSchema).optional()
}).strict();

export const ProjectUpdateInputSchema: z.ZodType<Prisma.ProjectUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.lazy(() => VisibilitySchema),z.lazy(() => EnumVisibilityFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProjectStatusSchema),z.lazy(() => EnumProjectStatusFieldUpdateOperationsInputSchema) ]).optional(),
  techStack: z.union([ z.lazy(() => ProjectUpdatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  demoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  owner: z.lazy(() => UserUpdateOneRequiredWithoutProjectsNestedInputSchema).optional(),
  collaborators: z.lazy(() => ProjectCollaboratorUpdateManyWithoutProjectNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUpdateManyWithoutProjectNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUpdateManyWithoutProjectNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUpdateManyWithoutProjectNestedInputSchema).optional(),
  files: z.lazy(() => ProjectFileUpdateManyWithoutProjectNestedInputSchema).optional()
}).strict();

export const ProjectUncheckedUpdateInputSchema: z.ZodType<Prisma.ProjectUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.lazy(() => VisibilitySchema),z.lazy(() => EnumVisibilityFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProjectStatusSchema),z.lazy(() => EnumProjectStatusFieldUpdateOperationsInputSchema) ]).optional(),
  techStack: z.union([ z.lazy(() => ProjectUpdatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  demoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ownerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  collaborators: z.lazy(() => ProjectCollaboratorUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  files: z.lazy(() => ProjectFileUncheckedUpdateManyWithoutProjectNestedInputSchema).optional()
}).strict();

export const ProjectCreateManyInputSchema: z.ZodType<Prisma.ProjectCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  visibility: z.lazy(() => VisibilitySchema),
  status: z.lazy(() => ProjectStatusSchema),
  techStack: z.union([ z.lazy(() => ProjectCreatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.string().optional().nullable(),
  demoUrl: z.string().optional().nullable(),
  ownerId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const ProjectUpdateManyMutationInputSchema: z.ZodType<Prisma.ProjectUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.lazy(() => VisibilitySchema),z.lazy(() => EnumVisibilityFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProjectStatusSchema),z.lazy(() => EnumProjectStatusFieldUpdateOperationsInputSchema) ]).optional(),
  techStack: z.union([ z.lazy(() => ProjectUpdatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  demoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProjectUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ProjectUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.lazy(() => VisibilitySchema),z.lazy(() => EnumVisibilityFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProjectStatusSchema),z.lazy(() => EnumProjectStatusFieldUpdateOperationsInputSchema) ]).optional(),
  techStack: z.union([ z.lazy(() => ProjectUpdatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  demoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ownerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProjectCollaboratorCreateInputSchema: z.ZodType<Prisma.ProjectCollaboratorCreateInput> = z.object({
  id: z.string().cuid().optional(),
  addedAt: z.coerce.date().optional(),
  project: z.lazy(() => ProjectCreateNestedOneWithoutCollaboratorsInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutCollaborationsInputSchema)
}).strict();

export const ProjectCollaboratorUncheckedCreateInputSchema: z.ZodType<Prisma.ProjectCollaboratorUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  projectId: z.string(),
  userId: z.string(),
  addedAt: z.coerce.date().optional()
}).strict();

export const ProjectCollaboratorUpdateInputSchema: z.ZodType<Prisma.ProjectCollaboratorUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  addedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  project: z.lazy(() => ProjectUpdateOneRequiredWithoutCollaboratorsNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutCollaborationsNestedInputSchema).optional()
}).strict();

export const ProjectCollaboratorUncheckedUpdateInputSchema: z.ZodType<Prisma.ProjectCollaboratorUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  projectId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  addedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProjectCollaboratorCreateManyInputSchema: z.ZodType<Prisma.ProjectCollaboratorCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  projectId: z.string(),
  userId: z.string(),
  addedAt: z.coerce.date().optional()
}).strict();

export const ProjectCollaboratorUpdateManyMutationInputSchema: z.ZodType<Prisma.ProjectCollaboratorUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  addedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProjectCollaboratorUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ProjectCollaboratorUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  projectId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  addedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProjectStarCreateInputSchema: z.ZodType<Prisma.ProjectStarCreateInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  project: z.lazy(() => ProjectCreateNestedOneWithoutStarsInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutStarsInputSchema)
}).strict();

export const ProjectStarUncheckedCreateInputSchema: z.ZodType<Prisma.ProjectStarUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  projectId: z.string(),
  userId: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export const ProjectStarUpdateInputSchema: z.ZodType<Prisma.ProjectStarUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  project: z.lazy(() => ProjectUpdateOneRequiredWithoutStarsNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutStarsNestedInputSchema).optional()
}).strict();

export const ProjectStarUncheckedUpdateInputSchema: z.ZodType<Prisma.ProjectStarUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  projectId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProjectStarCreateManyInputSchema: z.ZodType<Prisma.ProjectStarCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  projectId: z.string(),
  userId: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export const ProjectStarUpdateManyMutationInputSchema: z.ZodType<Prisma.ProjectStarUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProjectStarUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ProjectStarUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  projectId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const CommentCreateInputSchema: z.ZodType<Prisma.CommentCreateInput> = z.object({
  id: z.string().cuid().optional(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  project: z.lazy(() => ProjectCreateNestedOneWithoutCommentsInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutCommentsInputSchema)
}).strict();

export const CommentUncheckedCreateInputSchema: z.ZodType<Prisma.CommentUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  projectId: z.string(),
  userId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export const CommentUpdateInputSchema: z.ZodType<Prisma.CommentUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  project: z.lazy(() => ProjectUpdateOneRequiredWithoutCommentsNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutCommentsNestedInputSchema).optional()
}).strict();

export const CommentUncheckedUpdateInputSchema: z.ZodType<Prisma.CommentUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  projectId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const CommentCreateManyInputSchema: z.ZodType<Prisma.CommentCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  projectId: z.string(),
  userId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export const CommentUpdateManyMutationInputSchema: z.ZodType<Prisma.CommentUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const CommentUncheckedUpdateManyInputSchema: z.ZodType<Prisma.CommentUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  projectId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FacultyAssignmentCreateInputSchema: z.ZodType<Prisma.FacultyAssignmentCreateInput> = z.object({
  id: z.string().cuid().optional(),
  assignedAt: z.coerce.date().optional(),
  reviewStatus: z.lazy(() => ReviewStatusSchema).optional(),
  grade: z.string().optional().nullable(),
  feedback: z.string().optional().nullable(),
  reviewedAt: z.coerce.date().optional().nullable(),
  project: z.lazy(() => ProjectCreateNestedOneWithoutFacultyAssignmentsInputSchema),
  faculty: z.lazy(() => UserCreateNestedOneWithoutFacultyAssignmentsInputSchema)
}).strict();

export const FacultyAssignmentUncheckedCreateInputSchema: z.ZodType<Prisma.FacultyAssignmentUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  projectId: z.string(),
  facultyId: z.string(),
  assignedAt: z.coerce.date().optional(),
  reviewStatus: z.lazy(() => ReviewStatusSchema).optional(),
  grade: z.string().optional().nullable(),
  feedback: z.string().optional().nullable(),
  reviewedAt: z.coerce.date().optional().nullable()
}).strict();

export const FacultyAssignmentUpdateInputSchema: z.ZodType<Prisma.FacultyAssignmentUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  assignedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reviewStatus: z.union([ z.lazy(() => ReviewStatusSchema),z.lazy(() => EnumReviewStatusFieldUpdateOperationsInputSchema) ]).optional(),
  grade: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  feedback: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reviewedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  project: z.lazy(() => ProjectUpdateOneRequiredWithoutFacultyAssignmentsNestedInputSchema).optional(),
  faculty: z.lazy(() => UserUpdateOneRequiredWithoutFacultyAssignmentsNestedInputSchema).optional()
}).strict();

export const FacultyAssignmentUncheckedUpdateInputSchema: z.ZodType<Prisma.FacultyAssignmentUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  projectId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  facultyId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  assignedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reviewStatus: z.union([ z.lazy(() => ReviewStatusSchema),z.lazy(() => EnumReviewStatusFieldUpdateOperationsInputSchema) ]).optional(),
  grade: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  feedback: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reviewedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const FacultyAssignmentCreateManyInputSchema: z.ZodType<Prisma.FacultyAssignmentCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  projectId: z.string(),
  facultyId: z.string(),
  assignedAt: z.coerce.date().optional(),
  reviewStatus: z.lazy(() => ReviewStatusSchema).optional(),
  grade: z.string().optional().nullable(),
  feedback: z.string().optional().nullable(),
  reviewedAt: z.coerce.date().optional().nullable()
}).strict();

export const FacultyAssignmentUpdateManyMutationInputSchema: z.ZodType<Prisma.FacultyAssignmentUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  assignedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reviewStatus: z.union([ z.lazy(() => ReviewStatusSchema),z.lazy(() => EnumReviewStatusFieldUpdateOperationsInputSchema) ]).optional(),
  grade: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  feedback: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reviewedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const FacultyAssignmentUncheckedUpdateManyInputSchema: z.ZodType<Prisma.FacultyAssignmentUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  projectId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  facultyId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  assignedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reviewStatus: z.union([ z.lazy(() => ReviewStatusSchema),z.lazy(() => EnumReviewStatusFieldUpdateOperationsInputSchema) ]).optional(),
  grade: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  feedback: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reviewedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const ProjectFileCreateInputSchema: z.ZodType<Prisma.ProjectFileCreateInput> = z.object({
  id: z.string().cuid().optional(),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number().int(),
  uploadedAt: z.coerce.date().optional(),
  project: z.lazy(() => ProjectCreateNestedOneWithoutFilesInputSchema)
}).strict();

export const ProjectFileUncheckedCreateInputSchema: z.ZodType<Prisma.ProjectFileUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  projectId: z.string(),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number().int(),
  uploadedAt: z.coerce.date().optional()
}).strict();

export const ProjectFileUpdateInputSchema: z.ZodType<Prisma.ProjectFileUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  filePath: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileSize: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  uploadedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  project: z.lazy(() => ProjectUpdateOneRequiredWithoutFilesNestedInputSchema).optional()
}).strict();

export const ProjectFileUncheckedUpdateInputSchema: z.ZodType<Prisma.ProjectFileUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  projectId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  filePath: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileSize: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  uploadedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProjectFileCreateManyInputSchema: z.ZodType<Prisma.ProjectFileCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  projectId: z.string(),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number().int(),
  uploadedAt: z.coerce.date().optional()
}).strict();

export const ProjectFileUpdateManyMutationInputSchema: z.ZodType<Prisma.ProjectFileUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  filePath: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileSize: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  uploadedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProjectFileUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ProjectFileUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  projectId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  filePath: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileSize: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  uploadedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const EnumRoleFilterSchema: z.ZodType<Prisma.EnumRoleFilter> = z.object({
  equals: z.lazy(() => RoleSchema).optional(),
  in: z.lazy(() => RoleSchema).array().optional(),
  notIn: z.lazy(() => RoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RoleSchema),z.lazy(() => NestedEnumRoleFilterSchema) ]).optional(),
}).strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const ProjectListRelationFilterSchema: z.ZodType<Prisma.ProjectListRelationFilter> = z.object({
  every: z.lazy(() => ProjectWhereInputSchema).optional(),
  some: z.lazy(() => ProjectWhereInputSchema).optional(),
  none: z.lazy(() => ProjectWhereInputSchema).optional()
}).strict();

export const CommentListRelationFilterSchema: z.ZodType<Prisma.CommentListRelationFilter> = z.object({
  every: z.lazy(() => CommentWhereInputSchema).optional(),
  some: z.lazy(() => CommentWhereInputSchema).optional(),
  none: z.lazy(() => CommentWhereInputSchema).optional()
}).strict();

export const ProjectCollaboratorListRelationFilterSchema: z.ZodType<Prisma.ProjectCollaboratorListRelationFilter> = z.object({
  every: z.lazy(() => ProjectCollaboratorWhereInputSchema).optional(),
  some: z.lazy(() => ProjectCollaboratorWhereInputSchema).optional(),
  none: z.lazy(() => ProjectCollaboratorWhereInputSchema).optional()
}).strict();

export const ProjectStarListRelationFilterSchema: z.ZodType<Prisma.ProjectStarListRelationFilter> = z.object({
  every: z.lazy(() => ProjectStarWhereInputSchema).optional(),
  some: z.lazy(() => ProjectStarWhereInputSchema).optional(),
  none: z.lazy(() => ProjectStarWhereInputSchema).optional()
}).strict();

export const FacultyAssignmentListRelationFilterSchema: z.ZodType<Prisma.FacultyAssignmentListRelationFilter> = z.object({
  every: z.lazy(() => FacultyAssignmentWhereInputSchema).optional(),
  some: z.lazy(() => FacultyAssignmentWhereInputSchema).optional(),
  none: z.lazy(() => FacultyAssignmentWhereInputSchema).optional()
}).strict();

export const ProjectOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ProjectOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const CommentOrderByRelationAggregateInputSchema: z.ZodType<Prisma.CommentOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProjectCollaboratorOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ProjectCollaboratorOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProjectStarOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ProjectStarOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FacultyAssignmentOrderByRelationAggregateInputSchema: z.ZodType<Prisma.FacultyAssignmentOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  institution: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  institution: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  institution: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const EnumRoleWithAggregatesFilterSchema: z.ZodType<Prisma.EnumRoleWithAggregatesFilter> = z.object({
  equals: z.lazy(() => RoleSchema).optional(),
  in: z.lazy(() => RoleSchema).array().optional(),
  notIn: z.lazy(() => RoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RoleSchema),z.lazy(() => NestedEnumRoleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRoleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRoleFilterSchema).optional()
}).strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const EnumVisibilityFilterSchema: z.ZodType<Prisma.EnumVisibilityFilter> = z.object({
  equals: z.lazy(() => VisibilitySchema).optional(),
  in: z.lazy(() => VisibilitySchema).array().optional(),
  notIn: z.lazy(() => VisibilitySchema).array().optional(),
  not: z.union([ z.lazy(() => VisibilitySchema),z.lazy(() => NestedEnumVisibilityFilterSchema) ]).optional(),
}).strict();

export const EnumProjectStatusFilterSchema: z.ZodType<Prisma.EnumProjectStatusFilter> = z.object({
  equals: z.lazy(() => ProjectStatusSchema).optional(),
  in: z.lazy(() => ProjectStatusSchema).array().optional(),
  notIn: z.lazy(() => ProjectStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ProjectStatusSchema),z.lazy(() => NestedEnumProjectStatusFilterSchema) ]).optional(),
}).strict();

export const StringNullableListFilterSchema: z.ZodType<Prisma.StringNullableListFilter> = z.object({
  equals: z.string().array().optional().nullable(),
  has: z.string().optional().nullable(),
  hasEvery: z.string().array().optional(),
  hasSome: z.string().array().optional(),
  isEmpty: z.boolean().optional()
}).strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const UserScalarRelationFilterSchema: z.ZodType<Prisma.UserScalarRelationFilter> = z.object({
  is: z.lazy(() => UserWhereInputSchema).optional(),
  isNot: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const ProjectFileListRelationFilterSchema: z.ZodType<Prisma.ProjectFileListRelationFilter> = z.object({
  every: z.lazy(() => ProjectFileWhereInputSchema).optional(),
  some: z.lazy(() => ProjectFileWhereInputSchema).optional(),
  none: z.lazy(() => ProjectFileWhereInputSchema).optional()
}).strict();

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.object({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional()
}).strict();

export const ProjectFileOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ProjectFileOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProjectCountOrderByAggregateInputSchema: z.ZodType<Prisma.ProjectCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  category: z.lazy(() => SortOrderSchema).optional(),
  visibility: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  techStack: z.lazy(() => SortOrderSchema).optional(),
  githubUrl: z.lazy(() => SortOrderSchema).optional(),
  demoUrl: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProjectMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ProjectMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  category: z.lazy(() => SortOrderSchema).optional(),
  visibility: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  githubUrl: z.lazy(() => SortOrderSchema).optional(),
  demoUrl: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProjectMinOrderByAggregateInputSchema: z.ZodType<Prisma.ProjectMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  category: z.lazy(() => SortOrderSchema).optional(),
  visibility: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  githubUrl: z.lazy(() => SortOrderSchema).optional(),
  demoUrl: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumVisibilityWithAggregatesFilterSchema: z.ZodType<Prisma.EnumVisibilityWithAggregatesFilter> = z.object({
  equals: z.lazy(() => VisibilitySchema).optional(),
  in: z.lazy(() => VisibilitySchema).array().optional(),
  notIn: z.lazy(() => VisibilitySchema).array().optional(),
  not: z.union([ z.lazy(() => VisibilitySchema),z.lazy(() => NestedEnumVisibilityWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumVisibilityFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumVisibilityFilterSchema).optional()
}).strict();

export const EnumProjectStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumProjectStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => ProjectStatusSchema).optional(),
  in: z.lazy(() => ProjectStatusSchema).array().optional(),
  notIn: z.lazy(() => ProjectStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ProjectStatusSchema),z.lazy(() => NestedEnumProjectStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumProjectStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumProjectStatusFilterSchema).optional()
}).strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const ProjectScalarRelationFilterSchema: z.ZodType<Prisma.ProjectScalarRelationFilter> = z.object({
  is: z.lazy(() => ProjectWhereInputSchema).optional(),
  isNot: z.lazy(() => ProjectWhereInputSchema).optional()
}).strict();

export const ProjectCollaboratorProjectIdUserIdCompoundUniqueInputSchema: z.ZodType<Prisma.ProjectCollaboratorProjectIdUserIdCompoundUniqueInput> = z.object({
  projectId: z.string(),
  userId: z.string()
}).strict();

export const ProjectCollaboratorCountOrderByAggregateInputSchema: z.ZodType<Prisma.ProjectCollaboratorCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  addedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProjectCollaboratorMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ProjectCollaboratorMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  addedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProjectCollaboratorMinOrderByAggregateInputSchema: z.ZodType<Prisma.ProjectCollaboratorMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  addedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProjectStarProjectIdUserIdCompoundUniqueInputSchema: z.ZodType<Prisma.ProjectStarProjectIdUserIdCompoundUniqueInput> = z.object({
  projectId: z.string(),
  userId: z.string()
}).strict();

export const ProjectStarCountOrderByAggregateInputSchema: z.ZodType<Prisma.ProjectStarCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProjectStarMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ProjectStarMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProjectStarMinOrderByAggregateInputSchema: z.ZodType<Prisma.ProjectStarMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const CommentCountOrderByAggregateInputSchema: z.ZodType<Prisma.CommentCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const CommentMaxOrderByAggregateInputSchema: z.ZodType<Prisma.CommentMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const CommentMinOrderByAggregateInputSchema: z.ZodType<Prisma.CommentMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumReviewStatusFilterSchema: z.ZodType<Prisma.EnumReviewStatusFilter> = z.object({
  equals: z.lazy(() => ReviewStatusSchema).optional(),
  in: z.lazy(() => ReviewStatusSchema).array().optional(),
  notIn: z.lazy(() => ReviewStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ReviewStatusSchema),z.lazy(() => NestedEnumReviewStatusFilterSchema) ]).optional(),
}).strict();

export const DateTimeNullableFilterSchema: z.ZodType<Prisma.DateTimeNullableFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const FacultyAssignmentCountOrderByAggregateInputSchema: z.ZodType<Prisma.FacultyAssignmentCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  facultyId: z.lazy(() => SortOrderSchema).optional(),
  assignedAt: z.lazy(() => SortOrderSchema).optional(),
  reviewStatus: z.lazy(() => SortOrderSchema).optional(),
  grade: z.lazy(() => SortOrderSchema).optional(),
  feedback: z.lazy(() => SortOrderSchema).optional(),
  reviewedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FacultyAssignmentMaxOrderByAggregateInputSchema: z.ZodType<Prisma.FacultyAssignmentMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  facultyId: z.lazy(() => SortOrderSchema).optional(),
  assignedAt: z.lazy(() => SortOrderSchema).optional(),
  reviewStatus: z.lazy(() => SortOrderSchema).optional(),
  grade: z.lazy(() => SortOrderSchema).optional(),
  feedback: z.lazy(() => SortOrderSchema).optional(),
  reviewedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FacultyAssignmentMinOrderByAggregateInputSchema: z.ZodType<Prisma.FacultyAssignmentMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  facultyId: z.lazy(() => SortOrderSchema).optional(),
  assignedAt: z.lazy(() => SortOrderSchema).optional(),
  reviewStatus: z.lazy(() => SortOrderSchema).optional(),
  grade: z.lazy(() => SortOrderSchema).optional(),
  feedback: z.lazy(() => SortOrderSchema).optional(),
  reviewedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumReviewStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumReviewStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => ReviewStatusSchema).optional(),
  in: z.lazy(() => ReviewStatusSchema).array().optional(),
  notIn: z.lazy(() => ReviewStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ReviewStatusSchema),z.lazy(() => NestedEnumReviewStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumReviewStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumReviewStatusFilterSchema).optional()
}).strict();

export const DateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeNullableWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional()
}).strict();

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const ProjectFileCountOrderByAggregateInputSchema: z.ZodType<Prisma.ProjectFileCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  fileName: z.lazy(() => SortOrderSchema).optional(),
  filePath: z.lazy(() => SortOrderSchema).optional(),
  fileSize: z.lazy(() => SortOrderSchema).optional(),
  uploadedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProjectFileAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ProjectFileAvgOrderByAggregateInput> = z.object({
  fileSize: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProjectFileMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ProjectFileMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  fileName: z.lazy(() => SortOrderSchema).optional(),
  filePath: z.lazy(() => SortOrderSchema).optional(),
  fileSize: z.lazy(() => SortOrderSchema).optional(),
  uploadedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProjectFileMinOrderByAggregateInputSchema: z.ZodType<Prisma.ProjectFileMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  projectId: z.lazy(() => SortOrderSchema).optional(),
  fileName: z.lazy(() => SortOrderSchema).optional(),
  filePath: z.lazy(() => SortOrderSchema).optional(),
  fileSize: z.lazy(() => SortOrderSchema).optional(),
  uploadedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProjectFileSumOrderByAggregateInputSchema: z.ZodType<Prisma.ProjectFileSumOrderByAggregateInput> = z.object({
  fileSize: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const ProjectCreateNestedManyWithoutOwnerInputSchema: z.ZodType<Prisma.ProjectCreateNestedManyWithoutOwnerInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCreateWithoutOwnerInputSchema),z.lazy(() => ProjectCreateWithoutOwnerInputSchema).array(),z.lazy(() => ProjectUncheckedCreateWithoutOwnerInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectCreateOrConnectWithoutOwnerInputSchema),z.lazy(() => ProjectCreateOrConnectWithoutOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectCreateManyOwnerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProjectWhereUniqueInputSchema),z.lazy(() => ProjectWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const CommentCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.CommentCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutUserInputSchema),z.lazy(() => CommentCreateWithoutUserInputSchema).array(),z.lazy(() => CommentUncheckedCreateWithoutUserInputSchema),z.lazy(() => CommentUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CommentCreateOrConnectWithoutUserInputSchema),z.lazy(() => CommentCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CommentCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ProjectCollaboratorCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ProjectCollaboratorCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCollaboratorCreateWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorCreateWithoutUserInputSchema).array(),z.lazy(() => ProjectCollaboratorUncheckedCreateWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectCollaboratorCreateOrConnectWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectCollaboratorCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ProjectStarCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ProjectStarCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => ProjectStarCreateWithoutUserInputSchema),z.lazy(() => ProjectStarCreateWithoutUserInputSchema).array(),z.lazy(() => ProjectStarUncheckedCreateWithoutUserInputSchema),z.lazy(() => ProjectStarUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectStarCreateOrConnectWithoutUserInputSchema),z.lazy(() => ProjectStarCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectStarCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProjectStarWhereUniqueInputSchema),z.lazy(() => ProjectStarWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const FacultyAssignmentCreateNestedManyWithoutFacultyInputSchema: z.ZodType<Prisma.FacultyAssignmentCreateNestedManyWithoutFacultyInput> = z.object({
  create: z.union([ z.lazy(() => FacultyAssignmentCreateWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentCreateWithoutFacultyInputSchema).array(),z.lazy(() => FacultyAssignmentUncheckedCreateWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentUncheckedCreateWithoutFacultyInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FacultyAssignmentCreateOrConnectWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentCreateOrConnectWithoutFacultyInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FacultyAssignmentCreateManyFacultyInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),z.lazy(() => FacultyAssignmentWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ProjectUncheckedCreateNestedManyWithoutOwnerInputSchema: z.ZodType<Prisma.ProjectUncheckedCreateNestedManyWithoutOwnerInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCreateWithoutOwnerInputSchema),z.lazy(() => ProjectCreateWithoutOwnerInputSchema).array(),z.lazy(() => ProjectUncheckedCreateWithoutOwnerInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectCreateOrConnectWithoutOwnerInputSchema),z.lazy(() => ProjectCreateOrConnectWithoutOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectCreateManyOwnerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProjectWhereUniqueInputSchema),z.lazy(() => ProjectWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const CommentUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.CommentUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutUserInputSchema),z.lazy(() => CommentCreateWithoutUserInputSchema).array(),z.lazy(() => CommentUncheckedCreateWithoutUserInputSchema),z.lazy(() => CommentUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CommentCreateOrConnectWithoutUserInputSchema),z.lazy(() => CommentCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CommentCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ProjectCollaboratorUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ProjectCollaboratorUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCollaboratorCreateWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorCreateWithoutUserInputSchema).array(),z.lazy(() => ProjectCollaboratorUncheckedCreateWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectCollaboratorCreateOrConnectWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectCollaboratorCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ProjectStarUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ProjectStarUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => ProjectStarCreateWithoutUserInputSchema),z.lazy(() => ProjectStarCreateWithoutUserInputSchema).array(),z.lazy(() => ProjectStarUncheckedCreateWithoutUserInputSchema),z.lazy(() => ProjectStarUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectStarCreateOrConnectWithoutUserInputSchema),z.lazy(() => ProjectStarCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectStarCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProjectStarWhereUniqueInputSchema),z.lazy(() => ProjectStarWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const FacultyAssignmentUncheckedCreateNestedManyWithoutFacultyInputSchema: z.ZodType<Prisma.FacultyAssignmentUncheckedCreateNestedManyWithoutFacultyInput> = z.object({
  create: z.union([ z.lazy(() => FacultyAssignmentCreateWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentCreateWithoutFacultyInputSchema).array(),z.lazy(() => FacultyAssignmentUncheckedCreateWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentUncheckedCreateWithoutFacultyInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FacultyAssignmentCreateOrConnectWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentCreateOrConnectWithoutFacultyInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FacultyAssignmentCreateManyFacultyInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),z.lazy(() => FacultyAssignmentWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();

export const EnumRoleFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumRoleFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => RoleSchema).optional()
}).strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional()
}).strict();

export const ProjectUpdateManyWithoutOwnerNestedInputSchema: z.ZodType<Prisma.ProjectUpdateManyWithoutOwnerNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCreateWithoutOwnerInputSchema),z.lazy(() => ProjectCreateWithoutOwnerInputSchema).array(),z.lazy(() => ProjectUncheckedCreateWithoutOwnerInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectCreateOrConnectWithoutOwnerInputSchema),z.lazy(() => ProjectCreateOrConnectWithoutOwnerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProjectUpsertWithWhereUniqueWithoutOwnerInputSchema),z.lazy(() => ProjectUpsertWithWhereUniqueWithoutOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectCreateManyOwnerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProjectWhereUniqueInputSchema),z.lazy(() => ProjectWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProjectWhereUniqueInputSchema),z.lazy(() => ProjectWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProjectWhereUniqueInputSchema),z.lazy(() => ProjectWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProjectWhereUniqueInputSchema),z.lazy(() => ProjectWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProjectUpdateWithWhereUniqueWithoutOwnerInputSchema),z.lazy(() => ProjectUpdateWithWhereUniqueWithoutOwnerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProjectUpdateManyWithWhereWithoutOwnerInputSchema),z.lazy(() => ProjectUpdateManyWithWhereWithoutOwnerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProjectScalarWhereInputSchema),z.lazy(() => ProjectScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const CommentUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.CommentUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutUserInputSchema),z.lazy(() => CommentCreateWithoutUserInputSchema).array(),z.lazy(() => CommentUncheckedCreateWithoutUserInputSchema),z.lazy(() => CommentUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CommentCreateOrConnectWithoutUserInputSchema),z.lazy(() => CommentCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CommentUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => CommentUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CommentCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CommentUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => CommentUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CommentUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => CommentUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CommentScalarWhereInputSchema),z.lazy(() => CommentScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ProjectCollaboratorUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.ProjectCollaboratorUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCollaboratorCreateWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorCreateWithoutUserInputSchema).array(),z.lazy(() => ProjectCollaboratorUncheckedCreateWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectCollaboratorCreateOrConnectWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProjectCollaboratorUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectCollaboratorCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProjectCollaboratorUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProjectCollaboratorUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProjectCollaboratorScalarWhereInputSchema),z.lazy(() => ProjectCollaboratorScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ProjectStarUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.ProjectStarUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProjectStarCreateWithoutUserInputSchema),z.lazy(() => ProjectStarCreateWithoutUserInputSchema).array(),z.lazy(() => ProjectStarUncheckedCreateWithoutUserInputSchema),z.lazy(() => ProjectStarUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectStarCreateOrConnectWithoutUserInputSchema),z.lazy(() => ProjectStarCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProjectStarUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ProjectStarUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectStarCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProjectStarWhereUniqueInputSchema),z.lazy(() => ProjectStarWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProjectStarWhereUniqueInputSchema),z.lazy(() => ProjectStarWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProjectStarWhereUniqueInputSchema),z.lazy(() => ProjectStarWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProjectStarWhereUniqueInputSchema),z.lazy(() => ProjectStarWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProjectStarUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ProjectStarUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProjectStarUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => ProjectStarUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProjectStarScalarWhereInputSchema),z.lazy(() => ProjectStarScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const FacultyAssignmentUpdateManyWithoutFacultyNestedInputSchema: z.ZodType<Prisma.FacultyAssignmentUpdateManyWithoutFacultyNestedInput> = z.object({
  create: z.union([ z.lazy(() => FacultyAssignmentCreateWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentCreateWithoutFacultyInputSchema).array(),z.lazy(() => FacultyAssignmentUncheckedCreateWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentUncheckedCreateWithoutFacultyInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FacultyAssignmentCreateOrConnectWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentCreateOrConnectWithoutFacultyInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FacultyAssignmentUpsertWithWhereUniqueWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentUpsertWithWhereUniqueWithoutFacultyInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FacultyAssignmentCreateManyFacultyInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),z.lazy(() => FacultyAssignmentWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),z.lazy(() => FacultyAssignmentWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),z.lazy(() => FacultyAssignmentWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),z.lazy(() => FacultyAssignmentWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FacultyAssignmentUpdateWithWhereUniqueWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentUpdateWithWhereUniqueWithoutFacultyInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FacultyAssignmentUpdateManyWithWhereWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentUpdateManyWithWhereWithoutFacultyInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FacultyAssignmentScalarWhereInputSchema),z.lazy(() => FacultyAssignmentScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ProjectUncheckedUpdateManyWithoutOwnerNestedInputSchema: z.ZodType<Prisma.ProjectUncheckedUpdateManyWithoutOwnerNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCreateWithoutOwnerInputSchema),z.lazy(() => ProjectCreateWithoutOwnerInputSchema).array(),z.lazy(() => ProjectUncheckedCreateWithoutOwnerInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectCreateOrConnectWithoutOwnerInputSchema),z.lazy(() => ProjectCreateOrConnectWithoutOwnerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProjectUpsertWithWhereUniqueWithoutOwnerInputSchema),z.lazy(() => ProjectUpsertWithWhereUniqueWithoutOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectCreateManyOwnerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProjectWhereUniqueInputSchema),z.lazy(() => ProjectWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProjectWhereUniqueInputSchema),z.lazy(() => ProjectWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProjectWhereUniqueInputSchema),z.lazy(() => ProjectWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProjectWhereUniqueInputSchema),z.lazy(() => ProjectWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProjectUpdateWithWhereUniqueWithoutOwnerInputSchema),z.lazy(() => ProjectUpdateWithWhereUniqueWithoutOwnerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProjectUpdateManyWithWhereWithoutOwnerInputSchema),z.lazy(() => ProjectUpdateManyWithWhereWithoutOwnerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProjectScalarWhereInputSchema),z.lazy(() => ProjectScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const CommentUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.CommentUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutUserInputSchema),z.lazy(() => CommentCreateWithoutUserInputSchema).array(),z.lazy(() => CommentUncheckedCreateWithoutUserInputSchema),z.lazy(() => CommentUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CommentCreateOrConnectWithoutUserInputSchema),z.lazy(() => CommentCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CommentUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => CommentUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CommentCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CommentUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => CommentUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CommentUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => CommentUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CommentScalarWhereInputSchema),z.lazy(() => CommentScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ProjectCollaboratorUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.ProjectCollaboratorUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCollaboratorCreateWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorCreateWithoutUserInputSchema).array(),z.lazy(() => ProjectCollaboratorUncheckedCreateWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectCollaboratorCreateOrConnectWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProjectCollaboratorUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectCollaboratorCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProjectCollaboratorUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProjectCollaboratorUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProjectCollaboratorScalarWhereInputSchema),z.lazy(() => ProjectCollaboratorScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ProjectStarUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.ProjectStarUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProjectStarCreateWithoutUserInputSchema),z.lazy(() => ProjectStarCreateWithoutUserInputSchema).array(),z.lazy(() => ProjectStarUncheckedCreateWithoutUserInputSchema),z.lazy(() => ProjectStarUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectStarCreateOrConnectWithoutUserInputSchema),z.lazy(() => ProjectStarCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProjectStarUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ProjectStarUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectStarCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProjectStarWhereUniqueInputSchema),z.lazy(() => ProjectStarWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProjectStarWhereUniqueInputSchema),z.lazy(() => ProjectStarWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProjectStarWhereUniqueInputSchema),z.lazy(() => ProjectStarWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProjectStarWhereUniqueInputSchema),z.lazy(() => ProjectStarWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProjectStarUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ProjectStarUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProjectStarUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => ProjectStarUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProjectStarScalarWhereInputSchema),z.lazy(() => ProjectStarScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const FacultyAssignmentUncheckedUpdateManyWithoutFacultyNestedInputSchema: z.ZodType<Prisma.FacultyAssignmentUncheckedUpdateManyWithoutFacultyNestedInput> = z.object({
  create: z.union([ z.lazy(() => FacultyAssignmentCreateWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentCreateWithoutFacultyInputSchema).array(),z.lazy(() => FacultyAssignmentUncheckedCreateWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentUncheckedCreateWithoutFacultyInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FacultyAssignmentCreateOrConnectWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentCreateOrConnectWithoutFacultyInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FacultyAssignmentUpsertWithWhereUniqueWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentUpsertWithWhereUniqueWithoutFacultyInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FacultyAssignmentCreateManyFacultyInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),z.lazy(() => FacultyAssignmentWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),z.lazy(() => FacultyAssignmentWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),z.lazy(() => FacultyAssignmentWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),z.lazy(() => FacultyAssignmentWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FacultyAssignmentUpdateWithWhereUniqueWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentUpdateWithWhereUniqueWithoutFacultyInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FacultyAssignmentUpdateManyWithWhereWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentUpdateManyWithWhereWithoutFacultyInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FacultyAssignmentScalarWhereInputSchema),z.lazy(() => FacultyAssignmentScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ProjectCreatetechStackInputSchema: z.ZodType<Prisma.ProjectCreatetechStackInput> = z.object({
  set: z.string().array()
}).strict();

export const UserCreateNestedOneWithoutProjectsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutProjectsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutProjectsInputSchema),z.lazy(() => UserUncheckedCreateWithoutProjectsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutProjectsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const ProjectCollaboratorCreateNestedManyWithoutProjectInputSchema: z.ZodType<Prisma.ProjectCollaboratorCreateNestedManyWithoutProjectInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCollaboratorCreateWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorCreateWithoutProjectInputSchema).array(),z.lazy(() => ProjectCollaboratorUncheckedCreateWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorUncheckedCreateWithoutProjectInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectCollaboratorCreateOrConnectWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorCreateOrConnectWithoutProjectInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectCollaboratorCreateManyProjectInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const CommentCreateNestedManyWithoutProjectInputSchema: z.ZodType<Prisma.CommentCreateNestedManyWithoutProjectInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutProjectInputSchema),z.lazy(() => CommentCreateWithoutProjectInputSchema).array(),z.lazy(() => CommentUncheckedCreateWithoutProjectInputSchema),z.lazy(() => CommentUncheckedCreateWithoutProjectInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CommentCreateOrConnectWithoutProjectInputSchema),z.lazy(() => CommentCreateOrConnectWithoutProjectInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CommentCreateManyProjectInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ProjectStarCreateNestedManyWithoutProjectInputSchema: z.ZodType<Prisma.ProjectStarCreateNestedManyWithoutProjectInput> = z.object({
  create: z.union([ z.lazy(() => ProjectStarCreateWithoutProjectInputSchema),z.lazy(() => ProjectStarCreateWithoutProjectInputSchema).array(),z.lazy(() => ProjectStarUncheckedCreateWithoutProjectInputSchema),z.lazy(() => ProjectStarUncheckedCreateWithoutProjectInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectStarCreateOrConnectWithoutProjectInputSchema),z.lazy(() => ProjectStarCreateOrConnectWithoutProjectInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectStarCreateManyProjectInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProjectStarWhereUniqueInputSchema),z.lazy(() => ProjectStarWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const FacultyAssignmentCreateNestedManyWithoutProjectInputSchema: z.ZodType<Prisma.FacultyAssignmentCreateNestedManyWithoutProjectInput> = z.object({
  create: z.union([ z.lazy(() => FacultyAssignmentCreateWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentCreateWithoutProjectInputSchema).array(),z.lazy(() => FacultyAssignmentUncheckedCreateWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentUncheckedCreateWithoutProjectInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FacultyAssignmentCreateOrConnectWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentCreateOrConnectWithoutProjectInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FacultyAssignmentCreateManyProjectInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),z.lazy(() => FacultyAssignmentWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ProjectFileCreateNestedManyWithoutProjectInputSchema: z.ZodType<Prisma.ProjectFileCreateNestedManyWithoutProjectInput> = z.object({
  create: z.union([ z.lazy(() => ProjectFileCreateWithoutProjectInputSchema),z.lazy(() => ProjectFileCreateWithoutProjectInputSchema).array(),z.lazy(() => ProjectFileUncheckedCreateWithoutProjectInputSchema),z.lazy(() => ProjectFileUncheckedCreateWithoutProjectInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectFileCreateOrConnectWithoutProjectInputSchema),z.lazy(() => ProjectFileCreateOrConnectWithoutProjectInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectFileCreateManyProjectInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProjectFileWhereUniqueInputSchema),z.lazy(() => ProjectFileWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ProjectCollaboratorUncheckedCreateNestedManyWithoutProjectInputSchema: z.ZodType<Prisma.ProjectCollaboratorUncheckedCreateNestedManyWithoutProjectInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCollaboratorCreateWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorCreateWithoutProjectInputSchema).array(),z.lazy(() => ProjectCollaboratorUncheckedCreateWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorUncheckedCreateWithoutProjectInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectCollaboratorCreateOrConnectWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorCreateOrConnectWithoutProjectInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectCollaboratorCreateManyProjectInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const CommentUncheckedCreateNestedManyWithoutProjectInputSchema: z.ZodType<Prisma.CommentUncheckedCreateNestedManyWithoutProjectInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutProjectInputSchema),z.lazy(() => CommentCreateWithoutProjectInputSchema).array(),z.lazy(() => CommentUncheckedCreateWithoutProjectInputSchema),z.lazy(() => CommentUncheckedCreateWithoutProjectInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CommentCreateOrConnectWithoutProjectInputSchema),z.lazy(() => CommentCreateOrConnectWithoutProjectInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CommentCreateManyProjectInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ProjectStarUncheckedCreateNestedManyWithoutProjectInputSchema: z.ZodType<Prisma.ProjectStarUncheckedCreateNestedManyWithoutProjectInput> = z.object({
  create: z.union([ z.lazy(() => ProjectStarCreateWithoutProjectInputSchema),z.lazy(() => ProjectStarCreateWithoutProjectInputSchema).array(),z.lazy(() => ProjectStarUncheckedCreateWithoutProjectInputSchema),z.lazy(() => ProjectStarUncheckedCreateWithoutProjectInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectStarCreateOrConnectWithoutProjectInputSchema),z.lazy(() => ProjectStarCreateOrConnectWithoutProjectInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectStarCreateManyProjectInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProjectStarWhereUniqueInputSchema),z.lazy(() => ProjectStarWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const FacultyAssignmentUncheckedCreateNestedManyWithoutProjectInputSchema: z.ZodType<Prisma.FacultyAssignmentUncheckedCreateNestedManyWithoutProjectInput> = z.object({
  create: z.union([ z.lazy(() => FacultyAssignmentCreateWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentCreateWithoutProjectInputSchema).array(),z.lazy(() => FacultyAssignmentUncheckedCreateWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentUncheckedCreateWithoutProjectInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FacultyAssignmentCreateOrConnectWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentCreateOrConnectWithoutProjectInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FacultyAssignmentCreateManyProjectInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),z.lazy(() => FacultyAssignmentWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ProjectFileUncheckedCreateNestedManyWithoutProjectInputSchema: z.ZodType<Prisma.ProjectFileUncheckedCreateNestedManyWithoutProjectInput> = z.object({
  create: z.union([ z.lazy(() => ProjectFileCreateWithoutProjectInputSchema),z.lazy(() => ProjectFileCreateWithoutProjectInputSchema).array(),z.lazy(() => ProjectFileUncheckedCreateWithoutProjectInputSchema),z.lazy(() => ProjectFileUncheckedCreateWithoutProjectInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectFileCreateOrConnectWithoutProjectInputSchema),z.lazy(() => ProjectFileCreateOrConnectWithoutProjectInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectFileCreateManyProjectInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProjectFileWhereUniqueInputSchema),z.lazy(() => ProjectFileWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EnumVisibilityFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumVisibilityFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => VisibilitySchema).optional()
}).strict();

export const EnumProjectStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumProjectStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => ProjectStatusSchema).optional()
}).strict();

export const ProjectUpdatetechStackInputSchema: z.ZodType<Prisma.ProjectUpdatetechStackInput> = z.object({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
}).strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional().nullable()
}).strict();

export const UserUpdateOneRequiredWithoutProjectsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutProjectsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutProjectsInputSchema),z.lazy(() => UserUncheckedCreateWithoutProjectsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutProjectsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutProjectsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutProjectsInputSchema),z.lazy(() => UserUpdateWithoutProjectsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutProjectsInputSchema) ]).optional(),
}).strict();

export const ProjectCollaboratorUpdateManyWithoutProjectNestedInputSchema: z.ZodType<Prisma.ProjectCollaboratorUpdateManyWithoutProjectNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCollaboratorCreateWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorCreateWithoutProjectInputSchema).array(),z.lazy(() => ProjectCollaboratorUncheckedCreateWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorUncheckedCreateWithoutProjectInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectCollaboratorCreateOrConnectWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorCreateOrConnectWithoutProjectInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProjectCollaboratorUpsertWithWhereUniqueWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorUpsertWithWhereUniqueWithoutProjectInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectCollaboratorCreateManyProjectInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProjectCollaboratorUpdateWithWhereUniqueWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorUpdateWithWhereUniqueWithoutProjectInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProjectCollaboratorUpdateManyWithWhereWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorUpdateManyWithWhereWithoutProjectInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProjectCollaboratorScalarWhereInputSchema),z.lazy(() => ProjectCollaboratorScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const CommentUpdateManyWithoutProjectNestedInputSchema: z.ZodType<Prisma.CommentUpdateManyWithoutProjectNestedInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutProjectInputSchema),z.lazy(() => CommentCreateWithoutProjectInputSchema).array(),z.lazy(() => CommentUncheckedCreateWithoutProjectInputSchema),z.lazy(() => CommentUncheckedCreateWithoutProjectInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CommentCreateOrConnectWithoutProjectInputSchema),z.lazy(() => CommentCreateOrConnectWithoutProjectInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CommentUpsertWithWhereUniqueWithoutProjectInputSchema),z.lazy(() => CommentUpsertWithWhereUniqueWithoutProjectInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CommentCreateManyProjectInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CommentUpdateWithWhereUniqueWithoutProjectInputSchema),z.lazy(() => CommentUpdateWithWhereUniqueWithoutProjectInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CommentUpdateManyWithWhereWithoutProjectInputSchema),z.lazy(() => CommentUpdateManyWithWhereWithoutProjectInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CommentScalarWhereInputSchema),z.lazy(() => CommentScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ProjectStarUpdateManyWithoutProjectNestedInputSchema: z.ZodType<Prisma.ProjectStarUpdateManyWithoutProjectNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProjectStarCreateWithoutProjectInputSchema),z.lazy(() => ProjectStarCreateWithoutProjectInputSchema).array(),z.lazy(() => ProjectStarUncheckedCreateWithoutProjectInputSchema),z.lazy(() => ProjectStarUncheckedCreateWithoutProjectInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectStarCreateOrConnectWithoutProjectInputSchema),z.lazy(() => ProjectStarCreateOrConnectWithoutProjectInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProjectStarUpsertWithWhereUniqueWithoutProjectInputSchema),z.lazy(() => ProjectStarUpsertWithWhereUniqueWithoutProjectInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectStarCreateManyProjectInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProjectStarWhereUniqueInputSchema),z.lazy(() => ProjectStarWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProjectStarWhereUniqueInputSchema),z.lazy(() => ProjectStarWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProjectStarWhereUniqueInputSchema),z.lazy(() => ProjectStarWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProjectStarWhereUniqueInputSchema),z.lazy(() => ProjectStarWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProjectStarUpdateWithWhereUniqueWithoutProjectInputSchema),z.lazy(() => ProjectStarUpdateWithWhereUniqueWithoutProjectInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProjectStarUpdateManyWithWhereWithoutProjectInputSchema),z.lazy(() => ProjectStarUpdateManyWithWhereWithoutProjectInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProjectStarScalarWhereInputSchema),z.lazy(() => ProjectStarScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const FacultyAssignmentUpdateManyWithoutProjectNestedInputSchema: z.ZodType<Prisma.FacultyAssignmentUpdateManyWithoutProjectNestedInput> = z.object({
  create: z.union([ z.lazy(() => FacultyAssignmentCreateWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentCreateWithoutProjectInputSchema).array(),z.lazy(() => FacultyAssignmentUncheckedCreateWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentUncheckedCreateWithoutProjectInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FacultyAssignmentCreateOrConnectWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentCreateOrConnectWithoutProjectInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FacultyAssignmentUpsertWithWhereUniqueWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentUpsertWithWhereUniqueWithoutProjectInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FacultyAssignmentCreateManyProjectInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),z.lazy(() => FacultyAssignmentWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),z.lazy(() => FacultyAssignmentWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),z.lazy(() => FacultyAssignmentWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),z.lazy(() => FacultyAssignmentWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FacultyAssignmentUpdateWithWhereUniqueWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentUpdateWithWhereUniqueWithoutProjectInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FacultyAssignmentUpdateManyWithWhereWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentUpdateManyWithWhereWithoutProjectInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FacultyAssignmentScalarWhereInputSchema),z.lazy(() => FacultyAssignmentScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ProjectFileUpdateManyWithoutProjectNestedInputSchema: z.ZodType<Prisma.ProjectFileUpdateManyWithoutProjectNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProjectFileCreateWithoutProjectInputSchema),z.lazy(() => ProjectFileCreateWithoutProjectInputSchema).array(),z.lazy(() => ProjectFileUncheckedCreateWithoutProjectInputSchema),z.lazy(() => ProjectFileUncheckedCreateWithoutProjectInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectFileCreateOrConnectWithoutProjectInputSchema),z.lazy(() => ProjectFileCreateOrConnectWithoutProjectInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProjectFileUpsertWithWhereUniqueWithoutProjectInputSchema),z.lazy(() => ProjectFileUpsertWithWhereUniqueWithoutProjectInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectFileCreateManyProjectInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProjectFileWhereUniqueInputSchema),z.lazy(() => ProjectFileWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProjectFileWhereUniqueInputSchema),z.lazy(() => ProjectFileWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProjectFileWhereUniqueInputSchema),z.lazy(() => ProjectFileWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProjectFileWhereUniqueInputSchema),z.lazy(() => ProjectFileWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProjectFileUpdateWithWhereUniqueWithoutProjectInputSchema),z.lazy(() => ProjectFileUpdateWithWhereUniqueWithoutProjectInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProjectFileUpdateManyWithWhereWithoutProjectInputSchema),z.lazy(() => ProjectFileUpdateManyWithWhereWithoutProjectInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProjectFileScalarWhereInputSchema),z.lazy(() => ProjectFileScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ProjectCollaboratorUncheckedUpdateManyWithoutProjectNestedInputSchema: z.ZodType<Prisma.ProjectCollaboratorUncheckedUpdateManyWithoutProjectNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCollaboratorCreateWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorCreateWithoutProjectInputSchema).array(),z.lazy(() => ProjectCollaboratorUncheckedCreateWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorUncheckedCreateWithoutProjectInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectCollaboratorCreateOrConnectWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorCreateOrConnectWithoutProjectInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProjectCollaboratorUpsertWithWhereUniqueWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorUpsertWithWhereUniqueWithoutProjectInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectCollaboratorCreateManyProjectInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProjectCollaboratorUpdateWithWhereUniqueWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorUpdateWithWhereUniqueWithoutProjectInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProjectCollaboratorUpdateManyWithWhereWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorUpdateManyWithWhereWithoutProjectInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProjectCollaboratorScalarWhereInputSchema),z.lazy(() => ProjectCollaboratorScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const CommentUncheckedUpdateManyWithoutProjectNestedInputSchema: z.ZodType<Prisma.CommentUncheckedUpdateManyWithoutProjectNestedInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutProjectInputSchema),z.lazy(() => CommentCreateWithoutProjectInputSchema).array(),z.lazy(() => CommentUncheckedCreateWithoutProjectInputSchema),z.lazy(() => CommentUncheckedCreateWithoutProjectInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CommentCreateOrConnectWithoutProjectInputSchema),z.lazy(() => CommentCreateOrConnectWithoutProjectInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CommentUpsertWithWhereUniqueWithoutProjectInputSchema),z.lazy(() => CommentUpsertWithWhereUniqueWithoutProjectInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CommentCreateManyProjectInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CommentUpdateWithWhereUniqueWithoutProjectInputSchema),z.lazy(() => CommentUpdateWithWhereUniqueWithoutProjectInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CommentUpdateManyWithWhereWithoutProjectInputSchema),z.lazy(() => CommentUpdateManyWithWhereWithoutProjectInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CommentScalarWhereInputSchema),z.lazy(() => CommentScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ProjectStarUncheckedUpdateManyWithoutProjectNestedInputSchema: z.ZodType<Prisma.ProjectStarUncheckedUpdateManyWithoutProjectNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProjectStarCreateWithoutProjectInputSchema),z.lazy(() => ProjectStarCreateWithoutProjectInputSchema).array(),z.lazy(() => ProjectStarUncheckedCreateWithoutProjectInputSchema),z.lazy(() => ProjectStarUncheckedCreateWithoutProjectInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectStarCreateOrConnectWithoutProjectInputSchema),z.lazy(() => ProjectStarCreateOrConnectWithoutProjectInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProjectStarUpsertWithWhereUniqueWithoutProjectInputSchema),z.lazy(() => ProjectStarUpsertWithWhereUniqueWithoutProjectInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectStarCreateManyProjectInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProjectStarWhereUniqueInputSchema),z.lazy(() => ProjectStarWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProjectStarWhereUniqueInputSchema),z.lazy(() => ProjectStarWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProjectStarWhereUniqueInputSchema),z.lazy(() => ProjectStarWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProjectStarWhereUniqueInputSchema),z.lazy(() => ProjectStarWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProjectStarUpdateWithWhereUniqueWithoutProjectInputSchema),z.lazy(() => ProjectStarUpdateWithWhereUniqueWithoutProjectInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProjectStarUpdateManyWithWhereWithoutProjectInputSchema),z.lazy(() => ProjectStarUpdateManyWithWhereWithoutProjectInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProjectStarScalarWhereInputSchema),z.lazy(() => ProjectStarScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const FacultyAssignmentUncheckedUpdateManyWithoutProjectNestedInputSchema: z.ZodType<Prisma.FacultyAssignmentUncheckedUpdateManyWithoutProjectNestedInput> = z.object({
  create: z.union([ z.lazy(() => FacultyAssignmentCreateWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentCreateWithoutProjectInputSchema).array(),z.lazy(() => FacultyAssignmentUncheckedCreateWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentUncheckedCreateWithoutProjectInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FacultyAssignmentCreateOrConnectWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentCreateOrConnectWithoutProjectInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FacultyAssignmentUpsertWithWhereUniqueWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentUpsertWithWhereUniqueWithoutProjectInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FacultyAssignmentCreateManyProjectInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),z.lazy(() => FacultyAssignmentWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),z.lazy(() => FacultyAssignmentWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),z.lazy(() => FacultyAssignmentWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),z.lazy(() => FacultyAssignmentWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FacultyAssignmentUpdateWithWhereUniqueWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentUpdateWithWhereUniqueWithoutProjectInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FacultyAssignmentUpdateManyWithWhereWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentUpdateManyWithWhereWithoutProjectInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FacultyAssignmentScalarWhereInputSchema),z.lazy(() => FacultyAssignmentScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ProjectFileUncheckedUpdateManyWithoutProjectNestedInputSchema: z.ZodType<Prisma.ProjectFileUncheckedUpdateManyWithoutProjectNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProjectFileCreateWithoutProjectInputSchema),z.lazy(() => ProjectFileCreateWithoutProjectInputSchema).array(),z.lazy(() => ProjectFileUncheckedCreateWithoutProjectInputSchema),z.lazy(() => ProjectFileUncheckedCreateWithoutProjectInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProjectFileCreateOrConnectWithoutProjectInputSchema),z.lazy(() => ProjectFileCreateOrConnectWithoutProjectInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProjectFileUpsertWithWhereUniqueWithoutProjectInputSchema),z.lazy(() => ProjectFileUpsertWithWhereUniqueWithoutProjectInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProjectFileCreateManyProjectInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProjectFileWhereUniqueInputSchema),z.lazy(() => ProjectFileWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProjectFileWhereUniqueInputSchema),z.lazy(() => ProjectFileWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProjectFileWhereUniqueInputSchema),z.lazy(() => ProjectFileWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProjectFileWhereUniqueInputSchema),z.lazy(() => ProjectFileWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProjectFileUpdateWithWhereUniqueWithoutProjectInputSchema),z.lazy(() => ProjectFileUpdateWithWhereUniqueWithoutProjectInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProjectFileUpdateManyWithWhereWithoutProjectInputSchema),z.lazy(() => ProjectFileUpdateManyWithWhereWithoutProjectInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProjectFileScalarWhereInputSchema),z.lazy(() => ProjectFileScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ProjectCreateNestedOneWithoutCollaboratorsInputSchema: z.ZodType<Prisma.ProjectCreateNestedOneWithoutCollaboratorsInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCreateWithoutCollaboratorsInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutCollaboratorsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProjectCreateOrConnectWithoutCollaboratorsInputSchema).optional(),
  connect: z.lazy(() => ProjectWhereUniqueInputSchema).optional()
}).strict();

export const UserCreateNestedOneWithoutCollaborationsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutCollaborationsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutCollaborationsInputSchema),z.lazy(() => UserUncheckedCreateWithoutCollaborationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutCollaborationsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const ProjectUpdateOneRequiredWithoutCollaboratorsNestedInputSchema: z.ZodType<Prisma.ProjectUpdateOneRequiredWithoutCollaboratorsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCreateWithoutCollaboratorsInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutCollaboratorsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProjectCreateOrConnectWithoutCollaboratorsInputSchema).optional(),
  upsert: z.lazy(() => ProjectUpsertWithoutCollaboratorsInputSchema).optional(),
  connect: z.lazy(() => ProjectWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProjectUpdateToOneWithWhereWithoutCollaboratorsInputSchema),z.lazy(() => ProjectUpdateWithoutCollaboratorsInputSchema),z.lazy(() => ProjectUncheckedUpdateWithoutCollaboratorsInputSchema) ]).optional(),
}).strict();

export const UserUpdateOneRequiredWithoutCollaborationsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutCollaborationsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutCollaborationsInputSchema),z.lazy(() => UserUncheckedCreateWithoutCollaborationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutCollaborationsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutCollaborationsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutCollaborationsInputSchema),z.lazy(() => UserUpdateWithoutCollaborationsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutCollaborationsInputSchema) ]).optional(),
}).strict();

export const ProjectCreateNestedOneWithoutStarsInputSchema: z.ZodType<Prisma.ProjectCreateNestedOneWithoutStarsInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCreateWithoutStarsInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutStarsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProjectCreateOrConnectWithoutStarsInputSchema).optional(),
  connect: z.lazy(() => ProjectWhereUniqueInputSchema).optional()
}).strict();

export const UserCreateNestedOneWithoutStarsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutStarsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutStarsInputSchema),z.lazy(() => UserUncheckedCreateWithoutStarsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutStarsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const ProjectUpdateOneRequiredWithoutStarsNestedInputSchema: z.ZodType<Prisma.ProjectUpdateOneRequiredWithoutStarsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCreateWithoutStarsInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutStarsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProjectCreateOrConnectWithoutStarsInputSchema).optional(),
  upsert: z.lazy(() => ProjectUpsertWithoutStarsInputSchema).optional(),
  connect: z.lazy(() => ProjectWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProjectUpdateToOneWithWhereWithoutStarsInputSchema),z.lazy(() => ProjectUpdateWithoutStarsInputSchema),z.lazy(() => ProjectUncheckedUpdateWithoutStarsInputSchema) ]).optional(),
}).strict();

export const UserUpdateOneRequiredWithoutStarsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutStarsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutStarsInputSchema),z.lazy(() => UserUncheckedCreateWithoutStarsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutStarsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutStarsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutStarsInputSchema),z.lazy(() => UserUpdateWithoutStarsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutStarsInputSchema) ]).optional(),
}).strict();

export const ProjectCreateNestedOneWithoutCommentsInputSchema: z.ZodType<Prisma.ProjectCreateNestedOneWithoutCommentsInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCreateWithoutCommentsInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutCommentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProjectCreateOrConnectWithoutCommentsInputSchema).optional(),
  connect: z.lazy(() => ProjectWhereUniqueInputSchema).optional()
}).strict();

export const UserCreateNestedOneWithoutCommentsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutCommentsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutCommentsInputSchema),z.lazy(() => UserUncheckedCreateWithoutCommentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutCommentsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const ProjectUpdateOneRequiredWithoutCommentsNestedInputSchema: z.ZodType<Prisma.ProjectUpdateOneRequiredWithoutCommentsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCreateWithoutCommentsInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutCommentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProjectCreateOrConnectWithoutCommentsInputSchema).optional(),
  upsert: z.lazy(() => ProjectUpsertWithoutCommentsInputSchema).optional(),
  connect: z.lazy(() => ProjectWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProjectUpdateToOneWithWhereWithoutCommentsInputSchema),z.lazy(() => ProjectUpdateWithoutCommentsInputSchema),z.lazy(() => ProjectUncheckedUpdateWithoutCommentsInputSchema) ]).optional(),
}).strict();

export const UserUpdateOneRequiredWithoutCommentsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutCommentsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutCommentsInputSchema),z.lazy(() => UserUncheckedCreateWithoutCommentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutCommentsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutCommentsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutCommentsInputSchema),z.lazy(() => UserUpdateWithoutCommentsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutCommentsInputSchema) ]).optional(),
}).strict();

export const ProjectCreateNestedOneWithoutFacultyAssignmentsInputSchema: z.ZodType<Prisma.ProjectCreateNestedOneWithoutFacultyAssignmentsInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCreateWithoutFacultyAssignmentsInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutFacultyAssignmentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProjectCreateOrConnectWithoutFacultyAssignmentsInputSchema).optional(),
  connect: z.lazy(() => ProjectWhereUniqueInputSchema).optional()
}).strict();

export const UserCreateNestedOneWithoutFacultyAssignmentsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutFacultyAssignmentsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutFacultyAssignmentsInputSchema),z.lazy(() => UserUncheckedCreateWithoutFacultyAssignmentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutFacultyAssignmentsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const EnumReviewStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumReviewStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => ReviewStatusSchema).optional()
}).strict();

export const NullableDateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional().nullable()
}).strict();

export const ProjectUpdateOneRequiredWithoutFacultyAssignmentsNestedInputSchema: z.ZodType<Prisma.ProjectUpdateOneRequiredWithoutFacultyAssignmentsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCreateWithoutFacultyAssignmentsInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutFacultyAssignmentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProjectCreateOrConnectWithoutFacultyAssignmentsInputSchema).optional(),
  upsert: z.lazy(() => ProjectUpsertWithoutFacultyAssignmentsInputSchema).optional(),
  connect: z.lazy(() => ProjectWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProjectUpdateToOneWithWhereWithoutFacultyAssignmentsInputSchema),z.lazy(() => ProjectUpdateWithoutFacultyAssignmentsInputSchema),z.lazy(() => ProjectUncheckedUpdateWithoutFacultyAssignmentsInputSchema) ]).optional(),
}).strict();

export const UserUpdateOneRequiredWithoutFacultyAssignmentsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutFacultyAssignmentsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutFacultyAssignmentsInputSchema),z.lazy(() => UserUncheckedCreateWithoutFacultyAssignmentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutFacultyAssignmentsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutFacultyAssignmentsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutFacultyAssignmentsInputSchema),z.lazy(() => UserUpdateWithoutFacultyAssignmentsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutFacultyAssignmentsInputSchema) ]).optional(),
}).strict();

export const ProjectCreateNestedOneWithoutFilesInputSchema: z.ZodType<Prisma.ProjectCreateNestedOneWithoutFilesInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCreateWithoutFilesInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutFilesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProjectCreateOrConnectWithoutFilesInputSchema).optional(),
  connect: z.lazy(() => ProjectWhereUniqueInputSchema).optional()
}).strict();

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const ProjectUpdateOneRequiredWithoutFilesNestedInputSchema: z.ZodType<Prisma.ProjectUpdateOneRequiredWithoutFilesNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProjectCreateWithoutFilesInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutFilesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProjectCreateOrConnectWithoutFilesInputSchema).optional(),
  upsert: z.lazy(() => ProjectUpsertWithoutFilesInputSchema).optional(),
  connect: z.lazy(() => ProjectWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProjectUpdateToOneWithWhereWithoutFilesInputSchema),z.lazy(() => ProjectUpdateWithoutFilesInputSchema),z.lazy(() => ProjectUncheckedUpdateWithoutFilesInputSchema) ]).optional(),
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedEnumRoleFilterSchema: z.ZodType<Prisma.NestedEnumRoleFilter> = z.object({
  equals: z.lazy(() => RoleSchema).optional(),
  in: z.lazy(() => RoleSchema).array().optional(),
  notIn: z.lazy(() => RoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RoleSchema),z.lazy(() => NestedEnumRoleFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedEnumRoleWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumRoleWithAggregatesFilter> = z.object({
  equals: z.lazy(() => RoleSchema).optional(),
  in: z.lazy(() => RoleSchema).array().optional(),
  notIn: z.lazy(() => RoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RoleSchema),z.lazy(() => NestedEnumRoleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRoleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRoleFilterSchema).optional()
}).strict();

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const NestedEnumVisibilityFilterSchema: z.ZodType<Prisma.NestedEnumVisibilityFilter> = z.object({
  equals: z.lazy(() => VisibilitySchema).optional(),
  in: z.lazy(() => VisibilitySchema).array().optional(),
  notIn: z.lazy(() => VisibilitySchema).array().optional(),
  not: z.union([ z.lazy(() => VisibilitySchema),z.lazy(() => NestedEnumVisibilityFilterSchema) ]).optional(),
}).strict();

export const NestedEnumProjectStatusFilterSchema: z.ZodType<Prisma.NestedEnumProjectStatusFilter> = z.object({
  equals: z.lazy(() => ProjectStatusSchema).optional(),
  in: z.lazy(() => ProjectStatusSchema).array().optional(),
  notIn: z.lazy(() => ProjectStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ProjectStatusSchema),z.lazy(() => NestedEnumProjectStatusFilterSchema) ]).optional(),
}).strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedEnumVisibilityWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumVisibilityWithAggregatesFilter> = z.object({
  equals: z.lazy(() => VisibilitySchema).optional(),
  in: z.lazy(() => VisibilitySchema).array().optional(),
  notIn: z.lazy(() => VisibilitySchema).array().optional(),
  not: z.union([ z.lazy(() => VisibilitySchema),z.lazy(() => NestedEnumVisibilityWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumVisibilityFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumVisibilityFilterSchema).optional()
}).strict();

export const NestedEnumProjectStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumProjectStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => ProjectStatusSchema).optional(),
  in: z.lazy(() => ProjectStatusSchema).array().optional(),
  notIn: z.lazy(() => ProjectStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ProjectStatusSchema),z.lazy(() => NestedEnumProjectStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumProjectStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumProjectStatusFilterSchema).optional()
}).strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedEnumReviewStatusFilterSchema: z.ZodType<Prisma.NestedEnumReviewStatusFilter> = z.object({
  equals: z.lazy(() => ReviewStatusSchema).optional(),
  in: z.lazy(() => ReviewStatusSchema).array().optional(),
  notIn: z.lazy(() => ReviewStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ReviewStatusSchema),z.lazy(() => NestedEnumReviewStatusFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeNullableFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedEnumReviewStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumReviewStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => ReviewStatusSchema).optional(),
  in: z.lazy(() => ReviewStatusSchema).array().optional(),
  notIn: z.lazy(() => ReviewStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ReviewStatusSchema),z.lazy(() => NestedEnumReviewStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumReviewStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumReviewStatusFilterSchema).optional()
}).strict();

export const NestedDateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional()
}).strict();

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const ProjectCreateWithoutOwnerInputSchema: z.ZodType<Prisma.ProjectCreateWithoutOwnerInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  visibility: z.lazy(() => VisibilitySchema),
  status: z.lazy(() => ProjectStatusSchema),
  techStack: z.union([ z.lazy(() => ProjectCreatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.string().optional().nullable(),
  demoUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  collaborators: z.lazy(() => ProjectCollaboratorCreateNestedManyWithoutProjectInputSchema).optional(),
  comments: z.lazy(() => CommentCreateNestedManyWithoutProjectInputSchema).optional(),
  stars: z.lazy(() => ProjectStarCreateNestedManyWithoutProjectInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentCreateNestedManyWithoutProjectInputSchema).optional(),
  files: z.lazy(() => ProjectFileCreateNestedManyWithoutProjectInputSchema).optional()
}).strict();

export const ProjectUncheckedCreateWithoutOwnerInputSchema: z.ZodType<Prisma.ProjectUncheckedCreateWithoutOwnerInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  visibility: z.lazy(() => VisibilitySchema),
  status: z.lazy(() => ProjectStatusSchema),
  techStack: z.union([ z.lazy(() => ProjectCreatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.string().optional().nullable(),
  demoUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  collaborators: z.lazy(() => ProjectCollaboratorUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  files: z.lazy(() => ProjectFileUncheckedCreateNestedManyWithoutProjectInputSchema).optional()
}).strict();

export const ProjectCreateOrConnectWithoutOwnerInputSchema: z.ZodType<Prisma.ProjectCreateOrConnectWithoutOwnerInput> = z.object({
  where: z.lazy(() => ProjectWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProjectCreateWithoutOwnerInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutOwnerInputSchema) ]),
}).strict();

export const ProjectCreateManyOwnerInputEnvelopeSchema: z.ZodType<Prisma.ProjectCreateManyOwnerInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ProjectCreateManyOwnerInputSchema),z.lazy(() => ProjectCreateManyOwnerInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const CommentCreateWithoutUserInputSchema: z.ZodType<Prisma.CommentCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  project: z.lazy(() => ProjectCreateNestedOneWithoutCommentsInputSchema)
}).strict();

export const CommentUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.CommentUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  projectId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export const CommentCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.CommentCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => CommentWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CommentCreateWithoutUserInputSchema),z.lazy(() => CommentUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const CommentCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.CommentCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => CommentCreateManyUserInputSchema),z.lazy(() => CommentCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ProjectCollaboratorCreateWithoutUserInputSchema: z.ZodType<Prisma.ProjectCollaboratorCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  addedAt: z.coerce.date().optional(),
  project: z.lazy(() => ProjectCreateNestedOneWithoutCollaboratorsInputSchema)
}).strict();

export const ProjectCollaboratorUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.ProjectCollaboratorUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  projectId: z.string(),
  addedAt: z.coerce.date().optional()
}).strict();

export const ProjectCollaboratorCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.ProjectCollaboratorCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProjectCollaboratorCreateWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const ProjectCollaboratorCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.ProjectCollaboratorCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ProjectCollaboratorCreateManyUserInputSchema),z.lazy(() => ProjectCollaboratorCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ProjectStarCreateWithoutUserInputSchema: z.ZodType<Prisma.ProjectStarCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  project: z.lazy(() => ProjectCreateNestedOneWithoutStarsInputSchema)
}).strict();

export const ProjectStarUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.ProjectStarUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  projectId: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export const ProjectStarCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.ProjectStarCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => ProjectStarWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProjectStarCreateWithoutUserInputSchema),z.lazy(() => ProjectStarUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const ProjectStarCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.ProjectStarCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ProjectStarCreateManyUserInputSchema),z.lazy(() => ProjectStarCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const FacultyAssignmentCreateWithoutFacultyInputSchema: z.ZodType<Prisma.FacultyAssignmentCreateWithoutFacultyInput> = z.object({
  id: z.string().cuid().optional(),
  assignedAt: z.coerce.date().optional(),
  reviewStatus: z.lazy(() => ReviewStatusSchema).optional(),
  grade: z.string().optional().nullable(),
  feedback: z.string().optional().nullable(),
  reviewedAt: z.coerce.date().optional().nullable(),
  project: z.lazy(() => ProjectCreateNestedOneWithoutFacultyAssignmentsInputSchema)
}).strict();

export const FacultyAssignmentUncheckedCreateWithoutFacultyInputSchema: z.ZodType<Prisma.FacultyAssignmentUncheckedCreateWithoutFacultyInput> = z.object({
  id: z.string().cuid().optional(),
  projectId: z.string(),
  assignedAt: z.coerce.date().optional(),
  reviewStatus: z.lazy(() => ReviewStatusSchema).optional(),
  grade: z.string().optional().nullable(),
  feedback: z.string().optional().nullable(),
  reviewedAt: z.coerce.date().optional().nullable()
}).strict();

export const FacultyAssignmentCreateOrConnectWithoutFacultyInputSchema: z.ZodType<Prisma.FacultyAssignmentCreateOrConnectWithoutFacultyInput> = z.object({
  where: z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FacultyAssignmentCreateWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentUncheckedCreateWithoutFacultyInputSchema) ]),
}).strict();

export const FacultyAssignmentCreateManyFacultyInputEnvelopeSchema: z.ZodType<Prisma.FacultyAssignmentCreateManyFacultyInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => FacultyAssignmentCreateManyFacultyInputSchema),z.lazy(() => FacultyAssignmentCreateManyFacultyInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ProjectUpsertWithWhereUniqueWithoutOwnerInputSchema: z.ZodType<Prisma.ProjectUpsertWithWhereUniqueWithoutOwnerInput> = z.object({
  where: z.lazy(() => ProjectWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ProjectUpdateWithoutOwnerInputSchema),z.lazy(() => ProjectUncheckedUpdateWithoutOwnerInputSchema) ]),
  create: z.union([ z.lazy(() => ProjectCreateWithoutOwnerInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutOwnerInputSchema) ]),
}).strict();

export const ProjectUpdateWithWhereUniqueWithoutOwnerInputSchema: z.ZodType<Prisma.ProjectUpdateWithWhereUniqueWithoutOwnerInput> = z.object({
  where: z.lazy(() => ProjectWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProjectUpdateWithoutOwnerInputSchema),z.lazy(() => ProjectUncheckedUpdateWithoutOwnerInputSchema) ]),
}).strict();

export const ProjectUpdateManyWithWhereWithoutOwnerInputSchema: z.ZodType<Prisma.ProjectUpdateManyWithWhereWithoutOwnerInput> = z.object({
  where: z.lazy(() => ProjectScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ProjectUpdateManyMutationInputSchema),z.lazy(() => ProjectUncheckedUpdateManyWithoutOwnerInputSchema) ]),
}).strict();

export const ProjectScalarWhereInputSchema: z.ZodType<Prisma.ProjectScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ProjectScalarWhereInputSchema),z.lazy(() => ProjectScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProjectScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProjectScalarWhereInputSchema),z.lazy(() => ProjectScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  category: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  visibility: z.union([ z.lazy(() => EnumVisibilityFilterSchema),z.lazy(() => VisibilitySchema) ]).optional(),
  status: z.union([ z.lazy(() => EnumProjectStatusFilterSchema),z.lazy(() => ProjectStatusSchema) ]).optional(),
  techStack: z.lazy(() => StringNullableListFilterSchema).optional(),
  githubUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  demoUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  ownerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const CommentUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.CommentUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => CommentWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CommentUpdateWithoutUserInputSchema),z.lazy(() => CommentUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => CommentCreateWithoutUserInputSchema),z.lazy(() => CommentUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const CommentUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.CommentUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => CommentWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CommentUpdateWithoutUserInputSchema),z.lazy(() => CommentUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const CommentUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.CommentUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => CommentScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CommentUpdateManyMutationInputSchema),z.lazy(() => CommentUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const CommentScalarWhereInputSchema: z.ZodType<Prisma.CommentScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => CommentScalarWhereInputSchema),z.lazy(() => CommentScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CommentScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CommentScalarWhereInputSchema),z.lazy(() => CommentScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  projectId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const ProjectCollaboratorUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ProjectCollaboratorUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ProjectCollaboratorUpdateWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => ProjectCollaboratorCreateWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const ProjectCollaboratorUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ProjectCollaboratorUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProjectCollaboratorUpdateWithoutUserInputSchema),z.lazy(() => ProjectCollaboratorUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const ProjectCollaboratorUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.ProjectCollaboratorUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => ProjectCollaboratorScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ProjectCollaboratorUpdateManyMutationInputSchema),z.lazy(() => ProjectCollaboratorUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const ProjectCollaboratorScalarWhereInputSchema: z.ZodType<Prisma.ProjectCollaboratorScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ProjectCollaboratorScalarWhereInputSchema),z.lazy(() => ProjectCollaboratorScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProjectCollaboratorScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProjectCollaboratorScalarWhereInputSchema),z.lazy(() => ProjectCollaboratorScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  projectId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  addedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const ProjectStarUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ProjectStarUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => ProjectStarWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ProjectStarUpdateWithoutUserInputSchema),z.lazy(() => ProjectStarUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => ProjectStarCreateWithoutUserInputSchema),z.lazy(() => ProjectStarUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const ProjectStarUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ProjectStarUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => ProjectStarWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProjectStarUpdateWithoutUserInputSchema),z.lazy(() => ProjectStarUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const ProjectStarUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.ProjectStarUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => ProjectStarScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ProjectStarUpdateManyMutationInputSchema),z.lazy(() => ProjectStarUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const ProjectStarScalarWhereInputSchema: z.ZodType<Prisma.ProjectStarScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ProjectStarScalarWhereInputSchema),z.lazy(() => ProjectStarScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProjectStarScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProjectStarScalarWhereInputSchema),z.lazy(() => ProjectStarScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  projectId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const FacultyAssignmentUpsertWithWhereUniqueWithoutFacultyInputSchema: z.ZodType<Prisma.FacultyAssignmentUpsertWithWhereUniqueWithoutFacultyInput> = z.object({
  where: z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => FacultyAssignmentUpdateWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentUncheckedUpdateWithoutFacultyInputSchema) ]),
  create: z.union([ z.lazy(() => FacultyAssignmentCreateWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentUncheckedCreateWithoutFacultyInputSchema) ]),
}).strict();

export const FacultyAssignmentUpdateWithWhereUniqueWithoutFacultyInputSchema: z.ZodType<Prisma.FacultyAssignmentUpdateWithWhereUniqueWithoutFacultyInput> = z.object({
  where: z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => FacultyAssignmentUpdateWithoutFacultyInputSchema),z.lazy(() => FacultyAssignmentUncheckedUpdateWithoutFacultyInputSchema) ]),
}).strict();

export const FacultyAssignmentUpdateManyWithWhereWithoutFacultyInputSchema: z.ZodType<Prisma.FacultyAssignmentUpdateManyWithWhereWithoutFacultyInput> = z.object({
  where: z.lazy(() => FacultyAssignmentScalarWhereInputSchema),
  data: z.union([ z.lazy(() => FacultyAssignmentUpdateManyMutationInputSchema),z.lazy(() => FacultyAssignmentUncheckedUpdateManyWithoutFacultyInputSchema) ]),
}).strict();

export const FacultyAssignmentScalarWhereInputSchema: z.ZodType<Prisma.FacultyAssignmentScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => FacultyAssignmentScalarWhereInputSchema),z.lazy(() => FacultyAssignmentScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FacultyAssignmentScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FacultyAssignmentScalarWhereInputSchema),z.lazy(() => FacultyAssignmentScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  projectId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  facultyId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  assignedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  reviewStatus: z.union([ z.lazy(() => EnumReviewStatusFilterSchema),z.lazy(() => ReviewStatusSchema) ]).optional(),
  grade: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  feedback: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  reviewedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
}).strict();

export const UserCreateWithoutProjectsInputSchema: z.ZodType<Prisma.UserCreateWithoutProjectsInput> = z.object({
  id: z.string().cuid().optional(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.lazy(() => RoleSchema),
  institution: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  comments: z.lazy(() => CommentCreateNestedManyWithoutUserInputSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorCreateNestedManyWithoutUserInputSchema).optional(),
  stars: z.lazy(() => ProjectStarCreateNestedManyWithoutUserInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentCreateNestedManyWithoutFacultyInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutProjectsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutProjectsInput> = z.object({
  id: z.string().cuid().optional(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.lazy(() => RoleSchema),
  institution: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  comments: z.lazy(() => CommentUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedCreateNestedManyWithoutFacultyInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutProjectsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutProjectsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutProjectsInputSchema),z.lazy(() => UserUncheckedCreateWithoutProjectsInputSchema) ]),
}).strict();

export const ProjectCollaboratorCreateWithoutProjectInputSchema: z.ZodType<Prisma.ProjectCollaboratorCreateWithoutProjectInput> = z.object({
  id: z.string().cuid().optional(),
  addedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutCollaborationsInputSchema)
}).strict();

export const ProjectCollaboratorUncheckedCreateWithoutProjectInputSchema: z.ZodType<Prisma.ProjectCollaboratorUncheckedCreateWithoutProjectInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  addedAt: z.coerce.date().optional()
}).strict();

export const ProjectCollaboratorCreateOrConnectWithoutProjectInputSchema: z.ZodType<Prisma.ProjectCollaboratorCreateOrConnectWithoutProjectInput> = z.object({
  where: z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProjectCollaboratorCreateWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorUncheckedCreateWithoutProjectInputSchema) ]),
}).strict();

export const ProjectCollaboratorCreateManyProjectInputEnvelopeSchema: z.ZodType<Prisma.ProjectCollaboratorCreateManyProjectInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ProjectCollaboratorCreateManyProjectInputSchema),z.lazy(() => ProjectCollaboratorCreateManyProjectInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const CommentCreateWithoutProjectInputSchema: z.ZodType<Prisma.CommentCreateWithoutProjectInput> = z.object({
  id: z.string().cuid().optional(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutCommentsInputSchema)
}).strict();

export const CommentUncheckedCreateWithoutProjectInputSchema: z.ZodType<Prisma.CommentUncheckedCreateWithoutProjectInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export const CommentCreateOrConnectWithoutProjectInputSchema: z.ZodType<Prisma.CommentCreateOrConnectWithoutProjectInput> = z.object({
  where: z.lazy(() => CommentWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CommentCreateWithoutProjectInputSchema),z.lazy(() => CommentUncheckedCreateWithoutProjectInputSchema) ]),
}).strict();

export const CommentCreateManyProjectInputEnvelopeSchema: z.ZodType<Prisma.CommentCreateManyProjectInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => CommentCreateManyProjectInputSchema),z.lazy(() => CommentCreateManyProjectInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ProjectStarCreateWithoutProjectInputSchema: z.ZodType<Prisma.ProjectStarCreateWithoutProjectInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutStarsInputSchema)
}).strict();

export const ProjectStarUncheckedCreateWithoutProjectInputSchema: z.ZodType<Prisma.ProjectStarUncheckedCreateWithoutProjectInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export const ProjectStarCreateOrConnectWithoutProjectInputSchema: z.ZodType<Prisma.ProjectStarCreateOrConnectWithoutProjectInput> = z.object({
  where: z.lazy(() => ProjectStarWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProjectStarCreateWithoutProjectInputSchema),z.lazy(() => ProjectStarUncheckedCreateWithoutProjectInputSchema) ]),
}).strict();

export const ProjectStarCreateManyProjectInputEnvelopeSchema: z.ZodType<Prisma.ProjectStarCreateManyProjectInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ProjectStarCreateManyProjectInputSchema),z.lazy(() => ProjectStarCreateManyProjectInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const FacultyAssignmentCreateWithoutProjectInputSchema: z.ZodType<Prisma.FacultyAssignmentCreateWithoutProjectInput> = z.object({
  id: z.string().cuid().optional(),
  assignedAt: z.coerce.date().optional(),
  reviewStatus: z.lazy(() => ReviewStatusSchema).optional(),
  grade: z.string().optional().nullable(),
  feedback: z.string().optional().nullable(),
  reviewedAt: z.coerce.date().optional().nullable(),
  faculty: z.lazy(() => UserCreateNestedOneWithoutFacultyAssignmentsInputSchema)
}).strict();

export const FacultyAssignmentUncheckedCreateWithoutProjectInputSchema: z.ZodType<Prisma.FacultyAssignmentUncheckedCreateWithoutProjectInput> = z.object({
  id: z.string().cuid().optional(),
  facultyId: z.string(),
  assignedAt: z.coerce.date().optional(),
  reviewStatus: z.lazy(() => ReviewStatusSchema).optional(),
  grade: z.string().optional().nullable(),
  feedback: z.string().optional().nullable(),
  reviewedAt: z.coerce.date().optional().nullable()
}).strict();

export const FacultyAssignmentCreateOrConnectWithoutProjectInputSchema: z.ZodType<Prisma.FacultyAssignmentCreateOrConnectWithoutProjectInput> = z.object({
  where: z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FacultyAssignmentCreateWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentUncheckedCreateWithoutProjectInputSchema) ]),
}).strict();

export const FacultyAssignmentCreateManyProjectInputEnvelopeSchema: z.ZodType<Prisma.FacultyAssignmentCreateManyProjectInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => FacultyAssignmentCreateManyProjectInputSchema),z.lazy(() => FacultyAssignmentCreateManyProjectInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ProjectFileCreateWithoutProjectInputSchema: z.ZodType<Prisma.ProjectFileCreateWithoutProjectInput> = z.object({
  id: z.string().cuid().optional(),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number().int(),
  uploadedAt: z.coerce.date().optional()
}).strict();

export const ProjectFileUncheckedCreateWithoutProjectInputSchema: z.ZodType<Prisma.ProjectFileUncheckedCreateWithoutProjectInput> = z.object({
  id: z.string().cuid().optional(),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number().int(),
  uploadedAt: z.coerce.date().optional()
}).strict();

export const ProjectFileCreateOrConnectWithoutProjectInputSchema: z.ZodType<Prisma.ProjectFileCreateOrConnectWithoutProjectInput> = z.object({
  where: z.lazy(() => ProjectFileWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProjectFileCreateWithoutProjectInputSchema),z.lazy(() => ProjectFileUncheckedCreateWithoutProjectInputSchema) ]),
}).strict();

export const ProjectFileCreateManyProjectInputEnvelopeSchema: z.ZodType<Prisma.ProjectFileCreateManyProjectInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ProjectFileCreateManyProjectInputSchema),z.lazy(() => ProjectFileCreateManyProjectInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const UserUpsertWithoutProjectsInputSchema: z.ZodType<Prisma.UserUpsertWithoutProjectsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutProjectsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutProjectsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutProjectsInputSchema),z.lazy(() => UserUncheckedCreateWithoutProjectsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutProjectsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutProjectsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutProjectsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutProjectsInputSchema) ]),
}).strict();

export const UserUpdateWithoutProjectsInputSchema: z.ZodType<Prisma.UserUpdateWithoutProjectsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  institution: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  comments: z.lazy(() => CommentUpdateManyWithoutUserNestedInputSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorUpdateManyWithoutUserNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUpdateManyWithoutUserNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUpdateManyWithoutFacultyNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutProjectsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutProjectsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  institution: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  comments: z.lazy(() => CommentUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedUpdateManyWithoutFacultyNestedInputSchema).optional()
}).strict();

export const ProjectCollaboratorUpsertWithWhereUniqueWithoutProjectInputSchema: z.ZodType<Prisma.ProjectCollaboratorUpsertWithWhereUniqueWithoutProjectInput> = z.object({
  where: z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ProjectCollaboratorUpdateWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorUncheckedUpdateWithoutProjectInputSchema) ]),
  create: z.union([ z.lazy(() => ProjectCollaboratorCreateWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorUncheckedCreateWithoutProjectInputSchema) ]),
}).strict();

export const ProjectCollaboratorUpdateWithWhereUniqueWithoutProjectInputSchema: z.ZodType<Prisma.ProjectCollaboratorUpdateWithWhereUniqueWithoutProjectInput> = z.object({
  where: z.lazy(() => ProjectCollaboratorWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProjectCollaboratorUpdateWithoutProjectInputSchema),z.lazy(() => ProjectCollaboratorUncheckedUpdateWithoutProjectInputSchema) ]),
}).strict();

export const ProjectCollaboratorUpdateManyWithWhereWithoutProjectInputSchema: z.ZodType<Prisma.ProjectCollaboratorUpdateManyWithWhereWithoutProjectInput> = z.object({
  where: z.lazy(() => ProjectCollaboratorScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ProjectCollaboratorUpdateManyMutationInputSchema),z.lazy(() => ProjectCollaboratorUncheckedUpdateManyWithoutProjectInputSchema) ]),
}).strict();

export const CommentUpsertWithWhereUniqueWithoutProjectInputSchema: z.ZodType<Prisma.CommentUpsertWithWhereUniqueWithoutProjectInput> = z.object({
  where: z.lazy(() => CommentWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CommentUpdateWithoutProjectInputSchema),z.lazy(() => CommentUncheckedUpdateWithoutProjectInputSchema) ]),
  create: z.union([ z.lazy(() => CommentCreateWithoutProjectInputSchema),z.lazy(() => CommentUncheckedCreateWithoutProjectInputSchema) ]),
}).strict();

export const CommentUpdateWithWhereUniqueWithoutProjectInputSchema: z.ZodType<Prisma.CommentUpdateWithWhereUniqueWithoutProjectInput> = z.object({
  where: z.lazy(() => CommentWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CommentUpdateWithoutProjectInputSchema),z.lazy(() => CommentUncheckedUpdateWithoutProjectInputSchema) ]),
}).strict();

export const CommentUpdateManyWithWhereWithoutProjectInputSchema: z.ZodType<Prisma.CommentUpdateManyWithWhereWithoutProjectInput> = z.object({
  where: z.lazy(() => CommentScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CommentUpdateManyMutationInputSchema),z.lazy(() => CommentUncheckedUpdateManyWithoutProjectInputSchema) ]),
}).strict();

export const ProjectStarUpsertWithWhereUniqueWithoutProjectInputSchema: z.ZodType<Prisma.ProjectStarUpsertWithWhereUniqueWithoutProjectInput> = z.object({
  where: z.lazy(() => ProjectStarWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ProjectStarUpdateWithoutProjectInputSchema),z.lazy(() => ProjectStarUncheckedUpdateWithoutProjectInputSchema) ]),
  create: z.union([ z.lazy(() => ProjectStarCreateWithoutProjectInputSchema),z.lazy(() => ProjectStarUncheckedCreateWithoutProjectInputSchema) ]),
}).strict();

export const ProjectStarUpdateWithWhereUniqueWithoutProjectInputSchema: z.ZodType<Prisma.ProjectStarUpdateWithWhereUniqueWithoutProjectInput> = z.object({
  where: z.lazy(() => ProjectStarWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProjectStarUpdateWithoutProjectInputSchema),z.lazy(() => ProjectStarUncheckedUpdateWithoutProjectInputSchema) ]),
}).strict();

export const ProjectStarUpdateManyWithWhereWithoutProjectInputSchema: z.ZodType<Prisma.ProjectStarUpdateManyWithWhereWithoutProjectInput> = z.object({
  where: z.lazy(() => ProjectStarScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ProjectStarUpdateManyMutationInputSchema),z.lazy(() => ProjectStarUncheckedUpdateManyWithoutProjectInputSchema) ]),
}).strict();

export const FacultyAssignmentUpsertWithWhereUniqueWithoutProjectInputSchema: z.ZodType<Prisma.FacultyAssignmentUpsertWithWhereUniqueWithoutProjectInput> = z.object({
  where: z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => FacultyAssignmentUpdateWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentUncheckedUpdateWithoutProjectInputSchema) ]),
  create: z.union([ z.lazy(() => FacultyAssignmentCreateWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentUncheckedCreateWithoutProjectInputSchema) ]),
}).strict();

export const FacultyAssignmentUpdateWithWhereUniqueWithoutProjectInputSchema: z.ZodType<Prisma.FacultyAssignmentUpdateWithWhereUniqueWithoutProjectInput> = z.object({
  where: z.lazy(() => FacultyAssignmentWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => FacultyAssignmentUpdateWithoutProjectInputSchema),z.lazy(() => FacultyAssignmentUncheckedUpdateWithoutProjectInputSchema) ]),
}).strict();

export const FacultyAssignmentUpdateManyWithWhereWithoutProjectInputSchema: z.ZodType<Prisma.FacultyAssignmentUpdateManyWithWhereWithoutProjectInput> = z.object({
  where: z.lazy(() => FacultyAssignmentScalarWhereInputSchema),
  data: z.union([ z.lazy(() => FacultyAssignmentUpdateManyMutationInputSchema),z.lazy(() => FacultyAssignmentUncheckedUpdateManyWithoutProjectInputSchema) ]),
}).strict();

export const ProjectFileUpsertWithWhereUniqueWithoutProjectInputSchema: z.ZodType<Prisma.ProjectFileUpsertWithWhereUniqueWithoutProjectInput> = z.object({
  where: z.lazy(() => ProjectFileWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ProjectFileUpdateWithoutProjectInputSchema),z.lazy(() => ProjectFileUncheckedUpdateWithoutProjectInputSchema) ]),
  create: z.union([ z.lazy(() => ProjectFileCreateWithoutProjectInputSchema),z.lazy(() => ProjectFileUncheckedCreateWithoutProjectInputSchema) ]),
}).strict();

export const ProjectFileUpdateWithWhereUniqueWithoutProjectInputSchema: z.ZodType<Prisma.ProjectFileUpdateWithWhereUniqueWithoutProjectInput> = z.object({
  where: z.lazy(() => ProjectFileWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProjectFileUpdateWithoutProjectInputSchema),z.lazy(() => ProjectFileUncheckedUpdateWithoutProjectInputSchema) ]),
}).strict();

export const ProjectFileUpdateManyWithWhereWithoutProjectInputSchema: z.ZodType<Prisma.ProjectFileUpdateManyWithWhereWithoutProjectInput> = z.object({
  where: z.lazy(() => ProjectFileScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ProjectFileUpdateManyMutationInputSchema),z.lazy(() => ProjectFileUncheckedUpdateManyWithoutProjectInputSchema) ]),
}).strict();

export const ProjectFileScalarWhereInputSchema: z.ZodType<Prisma.ProjectFileScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ProjectFileScalarWhereInputSchema),z.lazy(() => ProjectFileScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProjectFileScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProjectFileScalarWhereInputSchema),z.lazy(() => ProjectFileScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  projectId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  fileName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  filePath: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  fileSize: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  uploadedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const ProjectCreateWithoutCollaboratorsInputSchema: z.ZodType<Prisma.ProjectCreateWithoutCollaboratorsInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  visibility: z.lazy(() => VisibilitySchema),
  status: z.lazy(() => ProjectStatusSchema),
  techStack: z.union([ z.lazy(() => ProjectCreatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.string().optional().nullable(),
  demoUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  owner: z.lazy(() => UserCreateNestedOneWithoutProjectsInputSchema),
  comments: z.lazy(() => CommentCreateNestedManyWithoutProjectInputSchema).optional(),
  stars: z.lazy(() => ProjectStarCreateNestedManyWithoutProjectInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentCreateNestedManyWithoutProjectInputSchema).optional(),
  files: z.lazy(() => ProjectFileCreateNestedManyWithoutProjectInputSchema).optional()
}).strict();

export const ProjectUncheckedCreateWithoutCollaboratorsInputSchema: z.ZodType<Prisma.ProjectUncheckedCreateWithoutCollaboratorsInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  visibility: z.lazy(() => VisibilitySchema),
  status: z.lazy(() => ProjectStatusSchema),
  techStack: z.union([ z.lazy(() => ProjectCreatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.string().optional().nullable(),
  demoUrl: z.string().optional().nullable(),
  ownerId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  comments: z.lazy(() => CommentUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  files: z.lazy(() => ProjectFileUncheckedCreateNestedManyWithoutProjectInputSchema).optional()
}).strict();

export const ProjectCreateOrConnectWithoutCollaboratorsInputSchema: z.ZodType<Prisma.ProjectCreateOrConnectWithoutCollaboratorsInput> = z.object({
  where: z.lazy(() => ProjectWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProjectCreateWithoutCollaboratorsInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutCollaboratorsInputSchema) ]),
}).strict();

export const UserCreateWithoutCollaborationsInputSchema: z.ZodType<Prisma.UserCreateWithoutCollaborationsInput> = z.object({
  id: z.string().cuid().optional(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.lazy(() => RoleSchema),
  institution: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  projects: z.lazy(() => ProjectCreateNestedManyWithoutOwnerInputSchema).optional(),
  comments: z.lazy(() => CommentCreateNestedManyWithoutUserInputSchema).optional(),
  stars: z.lazy(() => ProjectStarCreateNestedManyWithoutUserInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentCreateNestedManyWithoutFacultyInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutCollaborationsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutCollaborationsInput> = z.object({
  id: z.string().cuid().optional(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.lazy(() => RoleSchema),
  institution: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  projects: z.lazy(() => ProjectUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedCreateNestedManyWithoutFacultyInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutCollaborationsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutCollaborationsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutCollaborationsInputSchema),z.lazy(() => UserUncheckedCreateWithoutCollaborationsInputSchema) ]),
}).strict();

export const ProjectUpsertWithoutCollaboratorsInputSchema: z.ZodType<Prisma.ProjectUpsertWithoutCollaboratorsInput> = z.object({
  update: z.union([ z.lazy(() => ProjectUpdateWithoutCollaboratorsInputSchema),z.lazy(() => ProjectUncheckedUpdateWithoutCollaboratorsInputSchema) ]),
  create: z.union([ z.lazy(() => ProjectCreateWithoutCollaboratorsInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutCollaboratorsInputSchema) ]),
  where: z.lazy(() => ProjectWhereInputSchema).optional()
}).strict();

export const ProjectUpdateToOneWithWhereWithoutCollaboratorsInputSchema: z.ZodType<Prisma.ProjectUpdateToOneWithWhereWithoutCollaboratorsInput> = z.object({
  where: z.lazy(() => ProjectWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProjectUpdateWithoutCollaboratorsInputSchema),z.lazy(() => ProjectUncheckedUpdateWithoutCollaboratorsInputSchema) ]),
}).strict();

export const ProjectUpdateWithoutCollaboratorsInputSchema: z.ZodType<Prisma.ProjectUpdateWithoutCollaboratorsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.lazy(() => VisibilitySchema),z.lazy(() => EnumVisibilityFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProjectStatusSchema),z.lazy(() => EnumProjectStatusFieldUpdateOperationsInputSchema) ]).optional(),
  techStack: z.union([ z.lazy(() => ProjectUpdatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  demoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  owner: z.lazy(() => UserUpdateOneRequiredWithoutProjectsNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUpdateManyWithoutProjectNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUpdateManyWithoutProjectNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUpdateManyWithoutProjectNestedInputSchema).optional(),
  files: z.lazy(() => ProjectFileUpdateManyWithoutProjectNestedInputSchema).optional()
}).strict();

export const ProjectUncheckedUpdateWithoutCollaboratorsInputSchema: z.ZodType<Prisma.ProjectUncheckedUpdateWithoutCollaboratorsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.lazy(() => VisibilitySchema),z.lazy(() => EnumVisibilityFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProjectStatusSchema),z.lazy(() => EnumProjectStatusFieldUpdateOperationsInputSchema) ]).optional(),
  techStack: z.union([ z.lazy(() => ProjectUpdatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  demoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ownerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  comments: z.lazy(() => CommentUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  files: z.lazy(() => ProjectFileUncheckedUpdateManyWithoutProjectNestedInputSchema).optional()
}).strict();

export const UserUpsertWithoutCollaborationsInputSchema: z.ZodType<Prisma.UserUpsertWithoutCollaborationsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutCollaborationsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutCollaborationsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutCollaborationsInputSchema),z.lazy(() => UserUncheckedCreateWithoutCollaborationsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutCollaborationsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutCollaborationsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutCollaborationsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutCollaborationsInputSchema) ]),
}).strict();

export const UserUpdateWithoutCollaborationsInputSchema: z.ZodType<Prisma.UserUpdateWithoutCollaborationsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  institution: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  projects: z.lazy(() => ProjectUpdateManyWithoutOwnerNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUpdateManyWithoutUserNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUpdateManyWithoutUserNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUpdateManyWithoutFacultyNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutCollaborationsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutCollaborationsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  institution: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  projects: z.lazy(() => ProjectUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedUpdateManyWithoutFacultyNestedInputSchema).optional()
}).strict();

export const ProjectCreateWithoutStarsInputSchema: z.ZodType<Prisma.ProjectCreateWithoutStarsInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  visibility: z.lazy(() => VisibilitySchema),
  status: z.lazy(() => ProjectStatusSchema),
  techStack: z.union([ z.lazy(() => ProjectCreatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.string().optional().nullable(),
  demoUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  owner: z.lazy(() => UserCreateNestedOneWithoutProjectsInputSchema),
  collaborators: z.lazy(() => ProjectCollaboratorCreateNestedManyWithoutProjectInputSchema).optional(),
  comments: z.lazy(() => CommentCreateNestedManyWithoutProjectInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentCreateNestedManyWithoutProjectInputSchema).optional(),
  files: z.lazy(() => ProjectFileCreateNestedManyWithoutProjectInputSchema).optional()
}).strict();

export const ProjectUncheckedCreateWithoutStarsInputSchema: z.ZodType<Prisma.ProjectUncheckedCreateWithoutStarsInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  visibility: z.lazy(() => VisibilitySchema),
  status: z.lazy(() => ProjectStatusSchema),
  techStack: z.union([ z.lazy(() => ProjectCreatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.string().optional().nullable(),
  demoUrl: z.string().optional().nullable(),
  ownerId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  collaborators: z.lazy(() => ProjectCollaboratorUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  files: z.lazy(() => ProjectFileUncheckedCreateNestedManyWithoutProjectInputSchema).optional()
}).strict();

export const ProjectCreateOrConnectWithoutStarsInputSchema: z.ZodType<Prisma.ProjectCreateOrConnectWithoutStarsInput> = z.object({
  where: z.lazy(() => ProjectWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProjectCreateWithoutStarsInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutStarsInputSchema) ]),
}).strict();

export const UserCreateWithoutStarsInputSchema: z.ZodType<Prisma.UserCreateWithoutStarsInput> = z.object({
  id: z.string().cuid().optional(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.lazy(() => RoleSchema),
  institution: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  projects: z.lazy(() => ProjectCreateNestedManyWithoutOwnerInputSchema).optional(),
  comments: z.lazy(() => CommentCreateNestedManyWithoutUserInputSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorCreateNestedManyWithoutUserInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentCreateNestedManyWithoutFacultyInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutStarsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutStarsInput> = z.object({
  id: z.string().cuid().optional(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.lazy(() => RoleSchema),
  institution: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  projects: z.lazy(() => ProjectUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedCreateNestedManyWithoutFacultyInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutStarsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutStarsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutStarsInputSchema),z.lazy(() => UserUncheckedCreateWithoutStarsInputSchema) ]),
}).strict();

export const ProjectUpsertWithoutStarsInputSchema: z.ZodType<Prisma.ProjectUpsertWithoutStarsInput> = z.object({
  update: z.union([ z.lazy(() => ProjectUpdateWithoutStarsInputSchema),z.lazy(() => ProjectUncheckedUpdateWithoutStarsInputSchema) ]),
  create: z.union([ z.lazy(() => ProjectCreateWithoutStarsInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutStarsInputSchema) ]),
  where: z.lazy(() => ProjectWhereInputSchema).optional()
}).strict();

export const ProjectUpdateToOneWithWhereWithoutStarsInputSchema: z.ZodType<Prisma.ProjectUpdateToOneWithWhereWithoutStarsInput> = z.object({
  where: z.lazy(() => ProjectWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProjectUpdateWithoutStarsInputSchema),z.lazy(() => ProjectUncheckedUpdateWithoutStarsInputSchema) ]),
}).strict();

export const ProjectUpdateWithoutStarsInputSchema: z.ZodType<Prisma.ProjectUpdateWithoutStarsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.lazy(() => VisibilitySchema),z.lazy(() => EnumVisibilityFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProjectStatusSchema),z.lazy(() => EnumProjectStatusFieldUpdateOperationsInputSchema) ]).optional(),
  techStack: z.union([ z.lazy(() => ProjectUpdatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  demoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  owner: z.lazy(() => UserUpdateOneRequiredWithoutProjectsNestedInputSchema).optional(),
  collaborators: z.lazy(() => ProjectCollaboratorUpdateManyWithoutProjectNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUpdateManyWithoutProjectNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUpdateManyWithoutProjectNestedInputSchema).optional(),
  files: z.lazy(() => ProjectFileUpdateManyWithoutProjectNestedInputSchema).optional()
}).strict();

export const ProjectUncheckedUpdateWithoutStarsInputSchema: z.ZodType<Prisma.ProjectUncheckedUpdateWithoutStarsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.lazy(() => VisibilitySchema),z.lazy(() => EnumVisibilityFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProjectStatusSchema),z.lazy(() => EnumProjectStatusFieldUpdateOperationsInputSchema) ]).optional(),
  techStack: z.union([ z.lazy(() => ProjectUpdatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  demoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ownerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  collaborators: z.lazy(() => ProjectCollaboratorUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  files: z.lazy(() => ProjectFileUncheckedUpdateManyWithoutProjectNestedInputSchema).optional()
}).strict();

export const UserUpsertWithoutStarsInputSchema: z.ZodType<Prisma.UserUpsertWithoutStarsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutStarsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutStarsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutStarsInputSchema),z.lazy(() => UserUncheckedCreateWithoutStarsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutStarsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutStarsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutStarsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutStarsInputSchema) ]),
}).strict();

export const UserUpdateWithoutStarsInputSchema: z.ZodType<Prisma.UserUpdateWithoutStarsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  institution: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  projects: z.lazy(() => ProjectUpdateManyWithoutOwnerNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUpdateManyWithoutUserNestedInputSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorUpdateManyWithoutUserNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUpdateManyWithoutFacultyNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutStarsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutStarsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  institution: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  projects: z.lazy(() => ProjectUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedUpdateManyWithoutFacultyNestedInputSchema).optional()
}).strict();

export const ProjectCreateWithoutCommentsInputSchema: z.ZodType<Prisma.ProjectCreateWithoutCommentsInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  visibility: z.lazy(() => VisibilitySchema),
  status: z.lazy(() => ProjectStatusSchema),
  techStack: z.union([ z.lazy(() => ProjectCreatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.string().optional().nullable(),
  demoUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  owner: z.lazy(() => UserCreateNestedOneWithoutProjectsInputSchema),
  collaborators: z.lazy(() => ProjectCollaboratorCreateNestedManyWithoutProjectInputSchema).optional(),
  stars: z.lazy(() => ProjectStarCreateNestedManyWithoutProjectInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentCreateNestedManyWithoutProjectInputSchema).optional(),
  files: z.lazy(() => ProjectFileCreateNestedManyWithoutProjectInputSchema).optional()
}).strict();

export const ProjectUncheckedCreateWithoutCommentsInputSchema: z.ZodType<Prisma.ProjectUncheckedCreateWithoutCommentsInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  visibility: z.lazy(() => VisibilitySchema),
  status: z.lazy(() => ProjectStatusSchema),
  techStack: z.union([ z.lazy(() => ProjectCreatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.string().optional().nullable(),
  demoUrl: z.string().optional().nullable(),
  ownerId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  collaborators: z.lazy(() => ProjectCollaboratorUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  files: z.lazy(() => ProjectFileUncheckedCreateNestedManyWithoutProjectInputSchema).optional()
}).strict();

export const ProjectCreateOrConnectWithoutCommentsInputSchema: z.ZodType<Prisma.ProjectCreateOrConnectWithoutCommentsInput> = z.object({
  where: z.lazy(() => ProjectWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProjectCreateWithoutCommentsInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutCommentsInputSchema) ]),
}).strict();

export const UserCreateWithoutCommentsInputSchema: z.ZodType<Prisma.UserCreateWithoutCommentsInput> = z.object({
  id: z.string().cuid().optional(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.lazy(() => RoleSchema),
  institution: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  projects: z.lazy(() => ProjectCreateNestedManyWithoutOwnerInputSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorCreateNestedManyWithoutUserInputSchema).optional(),
  stars: z.lazy(() => ProjectStarCreateNestedManyWithoutUserInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentCreateNestedManyWithoutFacultyInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutCommentsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutCommentsInput> = z.object({
  id: z.string().cuid().optional(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.lazy(() => RoleSchema),
  institution: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  projects: z.lazy(() => ProjectUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedCreateNestedManyWithoutFacultyInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutCommentsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutCommentsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutCommentsInputSchema),z.lazy(() => UserUncheckedCreateWithoutCommentsInputSchema) ]),
}).strict();

export const ProjectUpsertWithoutCommentsInputSchema: z.ZodType<Prisma.ProjectUpsertWithoutCommentsInput> = z.object({
  update: z.union([ z.lazy(() => ProjectUpdateWithoutCommentsInputSchema),z.lazy(() => ProjectUncheckedUpdateWithoutCommentsInputSchema) ]),
  create: z.union([ z.lazy(() => ProjectCreateWithoutCommentsInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutCommentsInputSchema) ]),
  where: z.lazy(() => ProjectWhereInputSchema).optional()
}).strict();

export const ProjectUpdateToOneWithWhereWithoutCommentsInputSchema: z.ZodType<Prisma.ProjectUpdateToOneWithWhereWithoutCommentsInput> = z.object({
  where: z.lazy(() => ProjectWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProjectUpdateWithoutCommentsInputSchema),z.lazy(() => ProjectUncheckedUpdateWithoutCommentsInputSchema) ]),
}).strict();

export const ProjectUpdateWithoutCommentsInputSchema: z.ZodType<Prisma.ProjectUpdateWithoutCommentsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.lazy(() => VisibilitySchema),z.lazy(() => EnumVisibilityFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProjectStatusSchema),z.lazy(() => EnumProjectStatusFieldUpdateOperationsInputSchema) ]).optional(),
  techStack: z.union([ z.lazy(() => ProjectUpdatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  demoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  owner: z.lazy(() => UserUpdateOneRequiredWithoutProjectsNestedInputSchema).optional(),
  collaborators: z.lazy(() => ProjectCollaboratorUpdateManyWithoutProjectNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUpdateManyWithoutProjectNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUpdateManyWithoutProjectNestedInputSchema).optional(),
  files: z.lazy(() => ProjectFileUpdateManyWithoutProjectNestedInputSchema).optional()
}).strict();

export const ProjectUncheckedUpdateWithoutCommentsInputSchema: z.ZodType<Prisma.ProjectUncheckedUpdateWithoutCommentsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.lazy(() => VisibilitySchema),z.lazy(() => EnumVisibilityFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProjectStatusSchema),z.lazy(() => EnumProjectStatusFieldUpdateOperationsInputSchema) ]).optional(),
  techStack: z.union([ z.lazy(() => ProjectUpdatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  demoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ownerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  collaborators: z.lazy(() => ProjectCollaboratorUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  files: z.lazy(() => ProjectFileUncheckedUpdateManyWithoutProjectNestedInputSchema).optional()
}).strict();

export const UserUpsertWithoutCommentsInputSchema: z.ZodType<Prisma.UserUpsertWithoutCommentsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutCommentsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutCommentsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutCommentsInputSchema),z.lazy(() => UserUncheckedCreateWithoutCommentsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutCommentsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutCommentsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutCommentsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutCommentsInputSchema) ]),
}).strict();

export const UserUpdateWithoutCommentsInputSchema: z.ZodType<Prisma.UserUpdateWithoutCommentsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  institution: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  projects: z.lazy(() => ProjectUpdateManyWithoutOwnerNestedInputSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorUpdateManyWithoutUserNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUpdateManyWithoutUserNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUpdateManyWithoutFacultyNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutCommentsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutCommentsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  institution: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  projects: z.lazy(() => ProjectUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedUpdateManyWithoutFacultyNestedInputSchema).optional()
}).strict();

export const ProjectCreateWithoutFacultyAssignmentsInputSchema: z.ZodType<Prisma.ProjectCreateWithoutFacultyAssignmentsInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  visibility: z.lazy(() => VisibilitySchema),
  status: z.lazy(() => ProjectStatusSchema),
  techStack: z.union([ z.lazy(() => ProjectCreatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.string().optional().nullable(),
  demoUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  owner: z.lazy(() => UserCreateNestedOneWithoutProjectsInputSchema),
  collaborators: z.lazy(() => ProjectCollaboratorCreateNestedManyWithoutProjectInputSchema).optional(),
  comments: z.lazy(() => CommentCreateNestedManyWithoutProjectInputSchema).optional(),
  stars: z.lazy(() => ProjectStarCreateNestedManyWithoutProjectInputSchema).optional(),
  files: z.lazy(() => ProjectFileCreateNestedManyWithoutProjectInputSchema).optional()
}).strict();

export const ProjectUncheckedCreateWithoutFacultyAssignmentsInputSchema: z.ZodType<Prisma.ProjectUncheckedCreateWithoutFacultyAssignmentsInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  visibility: z.lazy(() => VisibilitySchema),
  status: z.lazy(() => ProjectStatusSchema),
  techStack: z.union([ z.lazy(() => ProjectCreatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.string().optional().nullable(),
  demoUrl: z.string().optional().nullable(),
  ownerId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  collaborators: z.lazy(() => ProjectCollaboratorUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  files: z.lazy(() => ProjectFileUncheckedCreateNestedManyWithoutProjectInputSchema).optional()
}).strict();

export const ProjectCreateOrConnectWithoutFacultyAssignmentsInputSchema: z.ZodType<Prisma.ProjectCreateOrConnectWithoutFacultyAssignmentsInput> = z.object({
  where: z.lazy(() => ProjectWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProjectCreateWithoutFacultyAssignmentsInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutFacultyAssignmentsInputSchema) ]),
}).strict();

export const UserCreateWithoutFacultyAssignmentsInputSchema: z.ZodType<Prisma.UserCreateWithoutFacultyAssignmentsInput> = z.object({
  id: z.string().cuid().optional(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.lazy(() => RoleSchema),
  institution: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  projects: z.lazy(() => ProjectCreateNestedManyWithoutOwnerInputSchema).optional(),
  comments: z.lazy(() => CommentCreateNestedManyWithoutUserInputSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorCreateNestedManyWithoutUserInputSchema).optional(),
  stars: z.lazy(() => ProjectStarCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutFacultyAssignmentsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutFacultyAssignmentsInput> = z.object({
  id: z.string().cuid().optional(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.lazy(() => RoleSchema),
  institution: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  projects: z.lazy(() => ProjectUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutFacultyAssignmentsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutFacultyAssignmentsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutFacultyAssignmentsInputSchema),z.lazy(() => UserUncheckedCreateWithoutFacultyAssignmentsInputSchema) ]),
}).strict();

export const ProjectUpsertWithoutFacultyAssignmentsInputSchema: z.ZodType<Prisma.ProjectUpsertWithoutFacultyAssignmentsInput> = z.object({
  update: z.union([ z.lazy(() => ProjectUpdateWithoutFacultyAssignmentsInputSchema),z.lazy(() => ProjectUncheckedUpdateWithoutFacultyAssignmentsInputSchema) ]),
  create: z.union([ z.lazy(() => ProjectCreateWithoutFacultyAssignmentsInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutFacultyAssignmentsInputSchema) ]),
  where: z.lazy(() => ProjectWhereInputSchema).optional()
}).strict();

export const ProjectUpdateToOneWithWhereWithoutFacultyAssignmentsInputSchema: z.ZodType<Prisma.ProjectUpdateToOneWithWhereWithoutFacultyAssignmentsInput> = z.object({
  where: z.lazy(() => ProjectWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProjectUpdateWithoutFacultyAssignmentsInputSchema),z.lazy(() => ProjectUncheckedUpdateWithoutFacultyAssignmentsInputSchema) ]),
}).strict();

export const ProjectUpdateWithoutFacultyAssignmentsInputSchema: z.ZodType<Prisma.ProjectUpdateWithoutFacultyAssignmentsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.lazy(() => VisibilitySchema),z.lazy(() => EnumVisibilityFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProjectStatusSchema),z.lazy(() => EnumProjectStatusFieldUpdateOperationsInputSchema) ]).optional(),
  techStack: z.union([ z.lazy(() => ProjectUpdatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  demoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  owner: z.lazy(() => UserUpdateOneRequiredWithoutProjectsNestedInputSchema).optional(),
  collaborators: z.lazy(() => ProjectCollaboratorUpdateManyWithoutProjectNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUpdateManyWithoutProjectNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUpdateManyWithoutProjectNestedInputSchema).optional(),
  files: z.lazy(() => ProjectFileUpdateManyWithoutProjectNestedInputSchema).optional()
}).strict();

export const ProjectUncheckedUpdateWithoutFacultyAssignmentsInputSchema: z.ZodType<Prisma.ProjectUncheckedUpdateWithoutFacultyAssignmentsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.lazy(() => VisibilitySchema),z.lazy(() => EnumVisibilityFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProjectStatusSchema),z.lazy(() => EnumProjectStatusFieldUpdateOperationsInputSchema) ]).optional(),
  techStack: z.union([ z.lazy(() => ProjectUpdatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  demoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ownerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  collaborators: z.lazy(() => ProjectCollaboratorUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  files: z.lazy(() => ProjectFileUncheckedUpdateManyWithoutProjectNestedInputSchema).optional()
}).strict();

export const UserUpsertWithoutFacultyAssignmentsInputSchema: z.ZodType<Prisma.UserUpsertWithoutFacultyAssignmentsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutFacultyAssignmentsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutFacultyAssignmentsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutFacultyAssignmentsInputSchema),z.lazy(() => UserUncheckedCreateWithoutFacultyAssignmentsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutFacultyAssignmentsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutFacultyAssignmentsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutFacultyAssignmentsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutFacultyAssignmentsInputSchema) ]),
}).strict();

export const UserUpdateWithoutFacultyAssignmentsInputSchema: z.ZodType<Prisma.UserUpdateWithoutFacultyAssignmentsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  institution: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  projects: z.lazy(() => ProjectUpdateManyWithoutOwnerNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUpdateManyWithoutUserNestedInputSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorUpdateManyWithoutUserNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutFacultyAssignmentsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutFacultyAssignmentsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  institution: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  projects: z.lazy(() => ProjectUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  collaborations: z.lazy(() => ProjectCollaboratorUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const ProjectCreateWithoutFilesInputSchema: z.ZodType<Prisma.ProjectCreateWithoutFilesInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  visibility: z.lazy(() => VisibilitySchema),
  status: z.lazy(() => ProjectStatusSchema),
  techStack: z.union([ z.lazy(() => ProjectCreatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.string().optional().nullable(),
  demoUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  owner: z.lazy(() => UserCreateNestedOneWithoutProjectsInputSchema),
  collaborators: z.lazy(() => ProjectCollaboratorCreateNestedManyWithoutProjectInputSchema).optional(),
  comments: z.lazy(() => CommentCreateNestedManyWithoutProjectInputSchema).optional(),
  stars: z.lazy(() => ProjectStarCreateNestedManyWithoutProjectInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentCreateNestedManyWithoutProjectInputSchema).optional()
}).strict();

export const ProjectUncheckedCreateWithoutFilesInputSchema: z.ZodType<Prisma.ProjectUncheckedCreateWithoutFilesInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  visibility: z.lazy(() => VisibilitySchema),
  status: z.lazy(() => ProjectStatusSchema),
  techStack: z.union([ z.lazy(() => ProjectCreatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.string().optional().nullable(),
  demoUrl: z.string().optional().nullable(),
  ownerId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  collaborators: z.lazy(() => ProjectCollaboratorUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedCreateNestedManyWithoutProjectInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedCreateNestedManyWithoutProjectInputSchema).optional()
}).strict();

export const ProjectCreateOrConnectWithoutFilesInputSchema: z.ZodType<Prisma.ProjectCreateOrConnectWithoutFilesInput> = z.object({
  where: z.lazy(() => ProjectWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProjectCreateWithoutFilesInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutFilesInputSchema) ]),
}).strict();

export const ProjectUpsertWithoutFilesInputSchema: z.ZodType<Prisma.ProjectUpsertWithoutFilesInput> = z.object({
  update: z.union([ z.lazy(() => ProjectUpdateWithoutFilesInputSchema),z.lazy(() => ProjectUncheckedUpdateWithoutFilesInputSchema) ]),
  create: z.union([ z.lazy(() => ProjectCreateWithoutFilesInputSchema),z.lazy(() => ProjectUncheckedCreateWithoutFilesInputSchema) ]),
  where: z.lazy(() => ProjectWhereInputSchema).optional()
}).strict();

export const ProjectUpdateToOneWithWhereWithoutFilesInputSchema: z.ZodType<Prisma.ProjectUpdateToOneWithWhereWithoutFilesInput> = z.object({
  where: z.lazy(() => ProjectWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProjectUpdateWithoutFilesInputSchema),z.lazy(() => ProjectUncheckedUpdateWithoutFilesInputSchema) ]),
}).strict();

export const ProjectUpdateWithoutFilesInputSchema: z.ZodType<Prisma.ProjectUpdateWithoutFilesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.lazy(() => VisibilitySchema),z.lazy(() => EnumVisibilityFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProjectStatusSchema),z.lazy(() => EnumProjectStatusFieldUpdateOperationsInputSchema) ]).optional(),
  techStack: z.union([ z.lazy(() => ProjectUpdatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  demoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  owner: z.lazy(() => UserUpdateOneRequiredWithoutProjectsNestedInputSchema).optional(),
  collaborators: z.lazy(() => ProjectCollaboratorUpdateManyWithoutProjectNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUpdateManyWithoutProjectNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUpdateManyWithoutProjectNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUpdateManyWithoutProjectNestedInputSchema).optional()
}).strict();

export const ProjectUncheckedUpdateWithoutFilesInputSchema: z.ZodType<Prisma.ProjectUncheckedUpdateWithoutFilesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.lazy(() => VisibilitySchema),z.lazy(() => EnumVisibilityFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProjectStatusSchema),z.lazy(() => EnumProjectStatusFieldUpdateOperationsInputSchema) ]).optional(),
  techStack: z.union([ z.lazy(() => ProjectUpdatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  demoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ownerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  collaborators: z.lazy(() => ProjectCollaboratorUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedUpdateManyWithoutProjectNestedInputSchema).optional()
}).strict();

export const ProjectCreateManyOwnerInputSchema: z.ZodType<Prisma.ProjectCreateManyOwnerInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  visibility: z.lazy(() => VisibilitySchema),
  status: z.lazy(() => ProjectStatusSchema),
  techStack: z.union([ z.lazy(() => ProjectCreatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.string().optional().nullable(),
  demoUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const CommentCreateManyUserInputSchema: z.ZodType<Prisma.CommentCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  projectId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export const ProjectCollaboratorCreateManyUserInputSchema: z.ZodType<Prisma.ProjectCollaboratorCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  projectId: z.string(),
  addedAt: z.coerce.date().optional()
}).strict();

export const ProjectStarCreateManyUserInputSchema: z.ZodType<Prisma.ProjectStarCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  projectId: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export const FacultyAssignmentCreateManyFacultyInputSchema: z.ZodType<Prisma.FacultyAssignmentCreateManyFacultyInput> = z.object({
  id: z.string().cuid().optional(),
  projectId: z.string(),
  assignedAt: z.coerce.date().optional(),
  reviewStatus: z.lazy(() => ReviewStatusSchema).optional(),
  grade: z.string().optional().nullable(),
  feedback: z.string().optional().nullable(),
  reviewedAt: z.coerce.date().optional().nullable()
}).strict();

export const ProjectUpdateWithoutOwnerInputSchema: z.ZodType<Prisma.ProjectUpdateWithoutOwnerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.lazy(() => VisibilitySchema),z.lazy(() => EnumVisibilityFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProjectStatusSchema),z.lazy(() => EnumProjectStatusFieldUpdateOperationsInputSchema) ]).optional(),
  techStack: z.union([ z.lazy(() => ProjectUpdatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  demoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  collaborators: z.lazy(() => ProjectCollaboratorUpdateManyWithoutProjectNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUpdateManyWithoutProjectNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUpdateManyWithoutProjectNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUpdateManyWithoutProjectNestedInputSchema).optional(),
  files: z.lazy(() => ProjectFileUpdateManyWithoutProjectNestedInputSchema).optional()
}).strict();

export const ProjectUncheckedUpdateWithoutOwnerInputSchema: z.ZodType<Prisma.ProjectUncheckedUpdateWithoutOwnerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.lazy(() => VisibilitySchema),z.lazy(() => EnumVisibilityFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProjectStatusSchema),z.lazy(() => EnumProjectStatusFieldUpdateOperationsInputSchema) ]).optional(),
  techStack: z.union([ z.lazy(() => ProjectUpdatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  demoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  collaborators: z.lazy(() => ProjectCollaboratorUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  stars: z.lazy(() => ProjectStarUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  facultyAssignments: z.lazy(() => FacultyAssignmentUncheckedUpdateManyWithoutProjectNestedInputSchema).optional(),
  files: z.lazy(() => ProjectFileUncheckedUpdateManyWithoutProjectNestedInputSchema).optional()
}).strict();

export const ProjectUncheckedUpdateManyWithoutOwnerInputSchema: z.ZodType<Prisma.ProjectUncheckedUpdateManyWithoutOwnerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.lazy(() => VisibilitySchema),z.lazy(() => EnumVisibilityFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProjectStatusSchema),z.lazy(() => EnumProjectStatusFieldUpdateOperationsInputSchema) ]).optional(),
  techStack: z.union([ z.lazy(() => ProjectUpdatetechStackInputSchema),z.string().array() ]).optional(),
  githubUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  demoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const CommentUpdateWithoutUserInputSchema: z.ZodType<Prisma.CommentUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  project: z.lazy(() => ProjectUpdateOneRequiredWithoutCommentsNestedInputSchema).optional()
}).strict();

export const CommentUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.CommentUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  projectId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const CommentUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.CommentUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  projectId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProjectCollaboratorUpdateWithoutUserInputSchema: z.ZodType<Prisma.ProjectCollaboratorUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  addedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  project: z.lazy(() => ProjectUpdateOneRequiredWithoutCollaboratorsNestedInputSchema).optional()
}).strict();

export const ProjectCollaboratorUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.ProjectCollaboratorUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  projectId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  addedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProjectCollaboratorUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.ProjectCollaboratorUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  projectId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  addedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProjectStarUpdateWithoutUserInputSchema: z.ZodType<Prisma.ProjectStarUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  project: z.lazy(() => ProjectUpdateOneRequiredWithoutStarsNestedInputSchema).optional()
}).strict();

export const ProjectStarUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.ProjectStarUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  projectId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProjectStarUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.ProjectStarUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  projectId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FacultyAssignmentUpdateWithoutFacultyInputSchema: z.ZodType<Prisma.FacultyAssignmentUpdateWithoutFacultyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  assignedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reviewStatus: z.union([ z.lazy(() => ReviewStatusSchema),z.lazy(() => EnumReviewStatusFieldUpdateOperationsInputSchema) ]).optional(),
  grade: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  feedback: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reviewedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  project: z.lazy(() => ProjectUpdateOneRequiredWithoutFacultyAssignmentsNestedInputSchema).optional()
}).strict();

export const FacultyAssignmentUncheckedUpdateWithoutFacultyInputSchema: z.ZodType<Prisma.FacultyAssignmentUncheckedUpdateWithoutFacultyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  projectId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  assignedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reviewStatus: z.union([ z.lazy(() => ReviewStatusSchema),z.lazy(() => EnumReviewStatusFieldUpdateOperationsInputSchema) ]).optional(),
  grade: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  feedback: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reviewedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const FacultyAssignmentUncheckedUpdateManyWithoutFacultyInputSchema: z.ZodType<Prisma.FacultyAssignmentUncheckedUpdateManyWithoutFacultyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  projectId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  assignedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reviewStatus: z.union([ z.lazy(() => ReviewStatusSchema),z.lazy(() => EnumReviewStatusFieldUpdateOperationsInputSchema) ]).optional(),
  grade: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  feedback: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reviewedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const ProjectCollaboratorCreateManyProjectInputSchema: z.ZodType<Prisma.ProjectCollaboratorCreateManyProjectInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  addedAt: z.coerce.date().optional()
}).strict();

export const CommentCreateManyProjectInputSchema: z.ZodType<Prisma.CommentCreateManyProjectInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export const ProjectStarCreateManyProjectInputSchema: z.ZodType<Prisma.ProjectStarCreateManyProjectInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export const FacultyAssignmentCreateManyProjectInputSchema: z.ZodType<Prisma.FacultyAssignmentCreateManyProjectInput> = z.object({
  id: z.string().cuid().optional(),
  facultyId: z.string(),
  assignedAt: z.coerce.date().optional(),
  reviewStatus: z.lazy(() => ReviewStatusSchema).optional(),
  grade: z.string().optional().nullable(),
  feedback: z.string().optional().nullable(),
  reviewedAt: z.coerce.date().optional().nullable()
}).strict();

export const ProjectFileCreateManyProjectInputSchema: z.ZodType<Prisma.ProjectFileCreateManyProjectInput> = z.object({
  id: z.string().cuid().optional(),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number().int(),
  uploadedAt: z.coerce.date().optional()
}).strict();

export const ProjectCollaboratorUpdateWithoutProjectInputSchema: z.ZodType<Prisma.ProjectCollaboratorUpdateWithoutProjectInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  addedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutCollaborationsNestedInputSchema).optional()
}).strict();

export const ProjectCollaboratorUncheckedUpdateWithoutProjectInputSchema: z.ZodType<Prisma.ProjectCollaboratorUncheckedUpdateWithoutProjectInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  addedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProjectCollaboratorUncheckedUpdateManyWithoutProjectInputSchema: z.ZodType<Prisma.ProjectCollaboratorUncheckedUpdateManyWithoutProjectInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  addedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const CommentUpdateWithoutProjectInputSchema: z.ZodType<Prisma.CommentUpdateWithoutProjectInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutCommentsNestedInputSchema).optional()
}).strict();

export const CommentUncheckedUpdateWithoutProjectInputSchema: z.ZodType<Prisma.CommentUncheckedUpdateWithoutProjectInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const CommentUncheckedUpdateManyWithoutProjectInputSchema: z.ZodType<Prisma.CommentUncheckedUpdateManyWithoutProjectInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProjectStarUpdateWithoutProjectInputSchema: z.ZodType<Prisma.ProjectStarUpdateWithoutProjectInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutStarsNestedInputSchema).optional()
}).strict();

export const ProjectStarUncheckedUpdateWithoutProjectInputSchema: z.ZodType<Prisma.ProjectStarUncheckedUpdateWithoutProjectInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProjectStarUncheckedUpdateManyWithoutProjectInputSchema: z.ZodType<Prisma.ProjectStarUncheckedUpdateManyWithoutProjectInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FacultyAssignmentUpdateWithoutProjectInputSchema: z.ZodType<Prisma.FacultyAssignmentUpdateWithoutProjectInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  assignedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reviewStatus: z.union([ z.lazy(() => ReviewStatusSchema),z.lazy(() => EnumReviewStatusFieldUpdateOperationsInputSchema) ]).optional(),
  grade: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  feedback: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reviewedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  faculty: z.lazy(() => UserUpdateOneRequiredWithoutFacultyAssignmentsNestedInputSchema).optional()
}).strict();

export const FacultyAssignmentUncheckedUpdateWithoutProjectInputSchema: z.ZodType<Prisma.FacultyAssignmentUncheckedUpdateWithoutProjectInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  facultyId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  assignedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reviewStatus: z.union([ z.lazy(() => ReviewStatusSchema),z.lazy(() => EnumReviewStatusFieldUpdateOperationsInputSchema) ]).optional(),
  grade: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  feedback: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reviewedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const FacultyAssignmentUncheckedUpdateManyWithoutProjectInputSchema: z.ZodType<Prisma.FacultyAssignmentUncheckedUpdateManyWithoutProjectInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  facultyId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  assignedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reviewStatus: z.union([ z.lazy(() => ReviewStatusSchema),z.lazy(() => EnumReviewStatusFieldUpdateOperationsInputSchema) ]).optional(),
  grade: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  feedback: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reviewedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const ProjectFileUpdateWithoutProjectInputSchema: z.ZodType<Prisma.ProjectFileUpdateWithoutProjectInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  filePath: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileSize: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  uploadedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProjectFileUncheckedUpdateWithoutProjectInputSchema: z.ZodType<Prisma.ProjectFileUncheckedUpdateWithoutProjectInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  filePath: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileSize: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  uploadedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProjectFileUncheckedUpdateManyWithoutProjectInputSchema: z.ZodType<Prisma.ProjectFileUncheckedUpdateManyWithoutProjectInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  filePath: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileSize: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  uploadedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const UserFindFirstArgsSchema: z.ZodType<Prisma.UserFindFirstArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserFindFirstOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserFindManyArgsSchema: z.ZodType<Prisma.UserFindManyArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserAggregateArgsSchema: z.ZodType<Prisma.UserAggregateArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserGroupByArgsSchema: z.ZodType<Prisma.UserGroupByArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithAggregationInputSchema.array(),UserOrderByWithAggregationInputSchema ]).optional(),
  by: UserScalarFieldEnumSchema.array(),
  having: UserScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserFindUniqueArgsSchema: z.ZodType<Prisma.UserFindUniqueArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserFindUniqueOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const ProjectFindFirstArgsSchema: z.ZodType<Prisma.ProjectFindFirstArgs> = z.object({
  select: ProjectSelectSchema.optional(),
  include: ProjectIncludeSchema.optional(),
  where: ProjectWhereInputSchema.optional(),
  orderBy: z.union([ ProjectOrderByWithRelationInputSchema.array(),ProjectOrderByWithRelationInputSchema ]).optional(),
  cursor: ProjectWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProjectScalarFieldEnumSchema,ProjectScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ProjectFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ProjectFindFirstOrThrowArgs> = z.object({
  select: ProjectSelectSchema.optional(),
  include: ProjectIncludeSchema.optional(),
  where: ProjectWhereInputSchema.optional(),
  orderBy: z.union([ ProjectOrderByWithRelationInputSchema.array(),ProjectOrderByWithRelationInputSchema ]).optional(),
  cursor: ProjectWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProjectScalarFieldEnumSchema,ProjectScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ProjectFindManyArgsSchema: z.ZodType<Prisma.ProjectFindManyArgs> = z.object({
  select: ProjectSelectSchema.optional(),
  include: ProjectIncludeSchema.optional(),
  where: ProjectWhereInputSchema.optional(),
  orderBy: z.union([ ProjectOrderByWithRelationInputSchema.array(),ProjectOrderByWithRelationInputSchema ]).optional(),
  cursor: ProjectWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProjectScalarFieldEnumSchema,ProjectScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ProjectAggregateArgsSchema: z.ZodType<Prisma.ProjectAggregateArgs> = z.object({
  where: ProjectWhereInputSchema.optional(),
  orderBy: z.union([ ProjectOrderByWithRelationInputSchema.array(),ProjectOrderByWithRelationInputSchema ]).optional(),
  cursor: ProjectWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ProjectGroupByArgsSchema: z.ZodType<Prisma.ProjectGroupByArgs> = z.object({
  where: ProjectWhereInputSchema.optional(),
  orderBy: z.union([ ProjectOrderByWithAggregationInputSchema.array(),ProjectOrderByWithAggregationInputSchema ]).optional(),
  by: ProjectScalarFieldEnumSchema.array(),
  having: ProjectScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ProjectFindUniqueArgsSchema: z.ZodType<Prisma.ProjectFindUniqueArgs> = z.object({
  select: ProjectSelectSchema.optional(),
  include: ProjectIncludeSchema.optional(),
  where: ProjectWhereUniqueInputSchema,
}).strict() ;

export const ProjectFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ProjectFindUniqueOrThrowArgs> = z.object({
  select: ProjectSelectSchema.optional(),
  include: ProjectIncludeSchema.optional(),
  where: ProjectWhereUniqueInputSchema,
}).strict() ;

export const ProjectCollaboratorFindFirstArgsSchema: z.ZodType<Prisma.ProjectCollaboratorFindFirstArgs> = z.object({
  select: ProjectCollaboratorSelectSchema.optional(),
  include: ProjectCollaboratorIncludeSchema.optional(),
  where: ProjectCollaboratorWhereInputSchema.optional(),
  orderBy: z.union([ ProjectCollaboratorOrderByWithRelationInputSchema.array(),ProjectCollaboratorOrderByWithRelationInputSchema ]).optional(),
  cursor: ProjectCollaboratorWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProjectCollaboratorScalarFieldEnumSchema,ProjectCollaboratorScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ProjectCollaboratorFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ProjectCollaboratorFindFirstOrThrowArgs> = z.object({
  select: ProjectCollaboratorSelectSchema.optional(),
  include: ProjectCollaboratorIncludeSchema.optional(),
  where: ProjectCollaboratorWhereInputSchema.optional(),
  orderBy: z.union([ ProjectCollaboratorOrderByWithRelationInputSchema.array(),ProjectCollaboratorOrderByWithRelationInputSchema ]).optional(),
  cursor: ProjectCollaboratorWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProjectCollaboratorScalarFieldEnumSchema,ProjectCollaboratorScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ProjectCollaboratorFindManyArgsSchema: z.ZodType<Prisma.ProjectCollaboratorFindManyArgs> = z.object({
  select: ProjectCollaboratorSelectSchema.optional(),
  include: ProjectCollaboratorIncludeSchema.optional(),
  where: ProjectCollaboratorWhereInputSchema.optional(),
  orderBy: z.union([ ProjectCollaboratorOrderByWithRelationInputSchema.array(),ProjectCollaboratorOrderByWithRelationInputSchema ]).optional(),
  cursor: ProjectCollaboratorWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProjectCollaboratorScalarFieldEnumSchema,ProjectCollaboratorScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ProjectCollaboratorAggregateArgsSchema: z.ZodType<Prisma.ProjectCollaboratorAggregateArgs> = z.object({
  where: ProjectCollaboratorWhereInputSchema.optional(),
  orderBy: z.union([ ProjectCollaboratorOrderByWithRelationInputSchema.array(),ProjectCollaboratorOrderByWithRelationInputSchema ]).optional(),
  cursor: ProjectCollaboratorWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ProjectCollaboratorGroupByArgsSchema: z.ZodType<Prisma.ProjectCollaboratorGroupByArgs> = z.object({
  where: ProjectCollaboratorWhereInputSchema.optional(),
  orderBy: z.union([ ProjectCollaboratorOrderByWithAggregationInputSchema.array(),ProjectCollaboratorOrderByWithAggregationInputSchema ]).optional(),
  by: ProjectCollaboratorScalarFieldEnumSchema.array(),
  having: ProjectCollaboratorScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ProjectCollaboratorFindUniqueArgsSchema: z.ZodType<Prisma.ProjectCollaboratorFindUniqueArgs> = z.object({
  select: ProjectCollaboratorSelectSchema.optional(),
  include: ProjectCollaboratorIncludeSchema.optional(),
  where: ProjectCollaboratorWhereUniqueInputSchema,
}).strict() ;

export const ProjectCollaboratorFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ProjectCollaboratorFindUniqueOrThrowArgs> = z.object({
  select: ProjectCollaboratorSelectSchema.optional(),
  include: ProjectCollaboratorIncludeSchema.optional(),
  where: ProjectCollaboratorWhereUniqueInputSchema,
}).strict() ;

export const ProjectStarFindFirstArgsSchema: z.ZodType<Prisma.ProjectStarFindFirstArgs> = z.object({
  select: ProjectStarSelectSchema.optional(),
  include: ProjectStarIncludeSchema.optional(),
  where: ProjectStarWhereInputSchema.optional(),
  orderBy: z.union([ ProjectStarOrderByWithRelationInputSchema.array(),ProjectStarOrderByWithRelationInputSchema ]).optional(),
  cursor: ProjectStarWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProjectStarScalarFieldEnumSchema,ProjectStarScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ProjectStarFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ProjectStarFindFirstOrThrowArgs> = z.object({
  select: ProjectStarSelectSchema.optional(),
  include: ProjectStarIncludeSchema.optional(),
  where: ProjectStarWhereInputSchema.optional(),
  orderBy: z.union([ ProjectStarOrderByWithRelationInputSchema.array(),ProjectStarOrderByWithRelationInputSchema ]).optional(),
  cursor: ProjectStarWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProjectStarScalarFieldEnumSchema,ProjectStarScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ProjectStarFindManyArgsSchema: z.ZodType<Prisma.ProjectStarFindManyArgs> = z.object({
  select: ProjectStarSelectSchema.optional(),
  include: ProjectStarIncludeSchema.optional(),
  where: ProjectStarWhereInputSchema.optional(),
  orderBy: z.union([ ProjectStarOrderByWithRelationInputSchema.array(),ProjectStarOrderByWithRelationInputSchema ]).optional(),
  cursor: ProjectStarWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProjectStarScalarFieldEnumSchema,ProjectStarScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ProjectStarAggregateArgsSchema: z.ZodType<Prisma.ProjectStarAggregateArgs> = z.object({
  where: ProjectStarWhereInputSchema.optional(),
  orderBy: z.union([ ProjectStarOrderByWithRelationInputSchema.array(),ProjectStarOrderByWithRelationInputSchema ]).optional(),
  cursor: ProjectStarWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ProjectStarGroupByArgsSchema: z.ZodType<Prisma.ProjectStarGroupByArgs> = z.object({
  where: ProjectStarWhereInputSchema.optional(),
  orderBy: z.union([ ProjectStarOrderByWithAggregationInputSchema.array(),ProjectStarOrderByWithAggregationInputSchema ]).optional(),
  by: ProjectStarScalarFieldEnumSchema.array(),
  having: ProjectStarScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ProjectStarFindUniqueArgsSchema: z.ZodType<Prisma.ProjectStarFindUniqueArgs> = z.object({
  select: ProjectStarSelectSchema.optional(),
  include: ProjectStarIncludeSchema.optional(),
  where: ProjectStarWhereUniqueInputSchema,
}).strict() ;

export const ProjectStarFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ProjectStarFindUniqueOrThrowArgs> = z.object({
  select: ProjectStarSelectSchema.optional(),
  include: ProjectStarIncludeSchema.optional(),
  where: ProjectStarWhereUniqueInputSchema,
}).strict() ;

export const CommentFindFirstArgsSchema: z.ZodType<Prisma.CommentFindFirstArgs> = z.object({
  select: CommentSelectSchema.optional(),
  include: CommentIncludeSchema.optional(),
  where: CommentWhereInputSchema.optional(),
  orderBy: z.union([ CommentOrderByWithRelationInputSchema.array(),CommentOrderByWithRelationInputSchema ]).optional(),
  cursor: CommentWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CommentScalarFieldEnumSchema,CommentScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const CommentFindFirstOrThrowArgsSchema: z.ZodType<Prisma.CommentFindFirstOrThrowArgs> = z.object({
  select: CommentSelectSchema.optional(),
  include: CommentIncludeSchema.optional(),
  where: CommentWhereInputSchema.optional(),
  orderBy: z.union([ CommentOrderByWithRelationInputSchema.array(),CommentOrderByWithRelationInputSchema ]).optional(),
  cursor: CommentWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CommentScalarFieldEnumSchema,CommentScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const CommentFindManyArgsSchema: z.ZodType<Prisma.CommentFindManyArgs> = z.object({
  select: CommentSelectSchema.optional(),
  include: CommentIncludeSchema.optional(),
  where: CommentWhereInputSchema.optional(),
  orderBy: z.union([ CommentOrderByWithRelationInputSchema.array(),CommentOrderByWithRelationInputSchema ]).optional(),
  cursor: CommentWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CommentScalarFieldEnumSchema,CommentScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const CommentAggregateArgsSchema: z.ZodType<Prisma.CommentAggregateArgs> = z.object({
  where: CommentWhereInputSchema.optional(),
  orderBy: z.union([ CommentOrderByWithRelationInputSchema.array(),CommentOrderByWithRelationInputSchema ]).optional(),
  cursor: CommentWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const CommentGroupByArgsSchema: z.ZodType<Prisma.CommentGroupByArgs> = z.object({
  where: CommentWhereInputSchema.optional(),
  orderBy: z.union([ CommentOrderByWithAggregationInputSchema.array(),CommentOrderByWithAggregationInputSchema ]).optional(),
  by: CommentScalarFieldEnumSchema.array(),
  having: CommentScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const CommentFindUniqueArgsSchema: z.ZodType<Prisma.CommentFindUniqueArgs> = z.object({
  select: CommentSelectSchema.optional(),
  include: CommentIncludeSchema.optional(),
  where: CommentWhereUniqueInputSchema,
}).strict() ;

export const CommentFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.CommentFindUniqueOrThrowArgs> = z.object({
  select: CommentSelectSchema.optional(),
  include: CommentIncludeSchema.optional(),
  where: CommentWhereUniqueInputSchema,
}).strict() ;

export const FacultyAssignmentFindFirstArgsSchema: z.ZodType<Prisma.FacultyAssignmentFindFirstArgs> = z.object({
  select: FacultyAssignmentSelectSchema.optional(),
  include: FacultyAssignmentIncludeSchema.optional(),
  where: FacultyAssignmentWhereInputSchema.optional(),
  orderBy: z.union([ FacultyAssignmentOrderByWithRelationInputSchema.array(),FacultyAssignmentOrderByWithRelationInputSchema ]).optional(),
  cursor: FacultyAssignmentWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ FacultyAssignmentScalarFieldEnumSchema,FacultyAssignmentScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const FacultyAssignmentFindFirstOrThrowArgsSchema: z.ZodType<Prisma.FacultyAssignmentFindFirstOrThrowArgs> = z.object({
  select: FacultyAssignmentSelectSchema.optional(),
  include: FacultyAssignmentIncludeSchema.optional(),
  where: FacultyAssignmentWhereInputSchema.optional(),
  orderBy: z.union([ FacultyAssignmentOrderByWithRelationInputSchema.array(),FacultyAssignmentOrderByWithRelationInputSchema ]).optional(),
  cursor: FacultyAssignmentWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ FacultyAssignmentScalarFieldEnumSchema,FacultyAssignmentScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const FacultyAssignmentFindManyArgsSchema: z.ZodType<Prisma.FacultyAssignmentFindManyArgs> = z.object({
  select: FacultyAssignmentSelectSchema.optional(),
  include: FacultyAssignmentIncludeSchema.optional(),
  where: FacultyAssignmentWhereInputSchema.optional(),
  orderBy: z.union([ FacultyAssignmentOrderByWithRelationInputSchema.array(),FacultyAssignmentOrderByWithRelationInputSchema ]).optional(),
  cursor: FacultyAssignmentWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ FacultyAssignmentScalarFieldEnumSchema,FacultyAssignmentScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const FacultyAssignmentAggregateArgsSchema: z.ZodType<Prisma.FacultyAssignmentAggregateArgs> = z.object({
  where: FacultyAssignmentWhereInputSchema.optional(),
  orderBy: z.union([ FacultyAssignmentOrderByWithRelationInputSchema.array(),FacultyAssignmentOrderByWithRelationInputSchema ]).optional(),
  cursor: FacultyAssignmentWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const FacultyAssignmentGroupByArgsSchema: z.ZodType<Prisma.FacultyAssignmentGroupByArgs> = z.object({
  where: FacultyAssignmentWhereInputSchema.optional(),
  orderBy: z.union([ FacultyAssignmentOrderByWithAggregationInputSchema.array(),FacultyAssignmentOrderByWithAggregationInputSchema ]).optional(),
  by: FacultyAssignmentScalarFieldEnumSchema.array(),
  having: FacultyAssignmentScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const FacultyAssignmentFindUniqueArgsSchema: z.ZodType<Prisma.FacultyAssignmentFindUniqueArgs> = z.object({
  select: FacultyAssignmentSelectSchema.optional(),
  include: FacultyAssignmentIncludeSchema.optional(),
  where: FacultyAssignmentWhereUniqueInputSchema,
}).strict() ;

export const FacultyAssignmentFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.FacultyAssignmentFindUniqueOrThrowArgs> = z.object({
  select: FacultyAssignmentSelectSchema.optional(),
  include: FacultyAssignmentIncludeSchema.optional(),
  where: FacultyAssignmentWhereUniqueInputSchema,
}).strict() ;

export const ProjectFileFindFirstArgsSchema: z.ZodType<Prisma.ProjectFileFindFirstArgs> = z.object({
  select: ProjectFileSelectSchema.optional(),
  include: ProjectFileIncludeSchema.optional(),
  where: ProjectFileWhereInputSchema.optional(),
  orderBy: z.union([ ProjectFileOrderByWithRelationInputSchema.array(),ProjectFileOrderByWithRelationInputSchema ]).optional(),
  cursor: ProjectFileWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProjectFileScalarFieldEnumSchema,ProjectFileScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ProjectFileFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ProjectFileFindFirstOrThrowArgs> = z.object({
  select: ProjectFileSelectSchema.optional(),
  include: ProjectFileIncludeSchema.optional(),
  where: ProjectFileWhereInputSchema.optional(),
  orderBy: z.union([ ProjectFileOrderByWithRelationInputSchema.array(),ProjectFileOrderByWithRelationInputSchema ]).optional(),
  cursor: ProjectFileWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProjectFileScalarFieldEnumSchema,ProjectFileScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ProjectFileFindManyArgsSchema: z.ZodType<Prisma.ProjectFileFindManyArgs> = z.object({
  select: ProjectFileSelectSchema.optional(),
  include: ProjectFileIncludeSchema.optional(),
  where: ProjectFileWhereInputSchema.optional(),
  orderBy: z.union([ ProjectFileOrderByWithRelationInputSchema.array(),ProjectFileOrderByWithRelationInputSchema ]).optional(),
  cursor: ProjectFileWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProjectFileScalarFieldEnumSchema,ProjectFileScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ProjectFileAggregateArgsSchema: z.ZodType<Prisma.ProjectFileAggregateArgs> = z.object({
  where: ProjectFileWhereInputSchema.optional(),
  orderBy: z.union([ ProjectFileOrderByWithRelationInputSchema.array(),ProjectFileOrderByWithRelationInputSchema ]).optional(),
  cursor: ProjectFileWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ProjectFileGroupByArgsSchema: z.ZodType<Prisma.ProjectFileGroupByArgs> = z.object({
  where: ProjectFileWhereInputSchema.optional(),
  orderBy: z.union([ ProjectFileOrderByWithAggregationInputSchema.array(),ProjectFileOrderByWithAggregationInputSchema ]).optional(),
  by: ProjectFileScalarFieldEnumSchema.array(),
  having: ProjectFileScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ProjectFileFindUniqueArgsSchema: z.ZodType<Prisma.ProjectFileFindUniqueArgs> = z.object({
  select: ProjectFileSelectSchema.optional(),
  include: ProjectFileIncludeSchema.optional(),
  where: ProjectFileWhereUniqueInputSchema,
}).strict() ;

export const ProjectFileFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ProjectFileFindUniqueOrThrowArgs> = z.object({
  select: ProjectFileSelectSchema.optional(),
  include: ProjectFileIncludeSchema.optional(),
  where: ProjectFileWhereUniqueInputSchema,
}).strict() ;

export const UserCreateArgsSchema: z.ZodType<Prisma.UserCreateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
}).strict() ;

export const UserUpsertArgsSchema: z.ZodType<Prisma.UserUpsertArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
  create: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
  update: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
}).strict() ;

export const UserCreateManyArgsSchema: z.ZodType<Prisma.UserCreateManyArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema,UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema,UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserDeleteArgsSchema: z.ZodType<Prisma.UserDeleteArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserUpdateArgsSchema: z.ZodType<Prisma.UserUpdateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserUpdateManyArgsSchema: z.ZodType<Prisma.UserUpdateManyArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema,UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const UserUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.UserUpdateManyAndReturnArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema,UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const ProjectCreateArgsSchema: z.ZodType<Prisma.ProjectCreateArgs> = z.object({
  select: ProjectSelectSchema.optional(),
  include: ProjectIncludeSchema.optional(),
  data: z.union([ ProjectCreateInputSchema,ProjectUncheckedCreateInputSchema ]),
}).strict() ;

export const ProjectUpsertArgsSchema: z.ZodType<Prisma.ProjectUpsertArgs> = z.object({
  select: ProjectSelectSchema.optional(),
  include: ProjectIncludeSchema.optional(),
  where: ProjectWhereUniqueInputSchema,
  create: z.union([ ProjectCreateInputSchema,ProjectUncheckedCreateInputSchema ]),
  update: z.union([ ProjectUpdateInputSchema,ProjectUncheckedUpdateInputSchema ]),
}).strict() ;

export const ProjectCreateManyArgsSchema: z.ZodType<Prisma.ProjectCreateManyArgs> = z.object({
  data: z.union([ ProjectCreateManyInputSchema,ProjectCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ProjectCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ProjectCreateManyAndReturnArgs> = z.object({
  data: z.union([ ProjectCreateManyInputSchema,ProjectCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ProjectDeleteArgsSchema: z.ZodType<Prisma.ProjectDeleteArgs> = z.object({
  select: ProjectSelectSchema.optional(),
  include: ProjectIncludeSchema.optional(),
  where: ProjectWhereUniqueInputSchema,
}).strict() ;

export const ProjectUpdateArgsSchema: z.ZodType<Prisma.ProjectUpdateArgs> = z.object({
  select: ProjectSelectSchema.optional(),
  include: ProjectIncludeSchema.optional(),
  data: z.union([ ProjectUpdateInputSchema,ProjectUncheckedUpdateInputSchema ]),
  where: ProjectWhereUniqueInputSchema,
}).strict() ;

export const ProjectUpdateManyArgsSchema: z.ZodType<Prisma.ProjectUpdateManyArgs> = z.object({
  data: z.union([ ProjectUpdateManyMutationInputSchema,ProjectUncheckedUpdateManyInputSchema ]),
  where: ProjectWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const ProjectUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ProjectUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ProjectUpdateManyMutationInputSchema,ProjectUncheckedUpdateManyInputSchema ]),
  where: ProjectWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const ProjectDeleteManyArgsSchema: z.ZodType<Prisma.ProjectDeleteManyArgs> = z.object({
  where: ProjectWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const ProjectCollaboratorCreateArgsSchema: z.ZodType<Prisma.ProjectCollaboratorCreateArgs> = z.object({
  select: ProjectCollaboratorSelectSchema.optional(),
  include: ProjectCollaboratorIncludeSchema.optional(),
  data: z.union([ ProjectCollaboratorCreateInputSchema,ProjectCollaboratorUncheckedCreateInputSchema ]),
}).strict() ;

export const ProjectCollaboratorUpsertArgsSchema: z.ZodType<Prisma.ProjectCollaboratorUpsertArgs> = z.object({
  select: ProjectCollaboratorSelectSchema.optional(),
  include: ProjectCollaboratorIncludeSchema.optional(),
  where: ProjectCollaboratorWhereUniqueInputSchema,
  create: z.union([ ProjectCollaboratorCreateInputSchema,ProjectCollaboratorUncheckedCreateInputSchema ]),
  update: z.union([ ProjectCollaboratorUpdateInputSchema,ProjectCollaboratorUncheckedUpdateInputSchema ]),
}).strict() ;

export const ProjectCollaboratorCreateManyArgsSchema: z.ZodType<Prisma.ProjectCollaboratorCreateManyArgs> = z.object({
  data: z.union([ ProjectCollaboratorCreateManyInputSchema,ProjectCollaboratorCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ProjectCollaboratorCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ProjectCollaboratorCreateManyAndReturnArgs> = z.object({
  data: z.union([ ProjectCollaboratorCreateManyInputSchema,ProjectCollaboratorCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ProjectCollaboratorDeleteArgsSchema: z.ZodType<Prisma.ProjectCollaboratorDeleteArgs> = z.object({
  select: ProjectCollaboratorSelectSchema.optional(),
  include: ProjectCollaboratorIncludeSchema.optional(),
  where: ProjectCollaboratorWhereUniqueInputSchema,
}).strict() ;

export const ProjectCollaboratorUpdateArgsSchema: z.ZodType<Prisma.ProjectCollaboratorUpdateArgs> = z.object({
  select: ProjectCollaboratorSelectSchema.optional(),
  include: ProjectCollaboratorIncludeSchema.optional(),
  data: z.union([ ProjectCollaboratorUpdateInputSchema,ProjectCollaboratorUncheckedUpdateInputSchema ]),
  where: ProjectCollaboratorWhereUniqueInputSchema,
}).strict() ;

export const ProjectCollaboratorUpdateManyArgsSchema: z.ZodType<Prisma.ProjectCollaboratorUpdateManyArgs> = z.object({
  data: z.union([ ProjectCollaboratorUpdateManyMutationInputSchema,ProjectCollaboratorUncheckedUpdateManyInputSchema ]),
  where: ProjectCollaboratorWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const ProjectCollaboratorUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ProjectCollaboratorUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ProjectCollaboratorUpdateManyMutationInputSchema,ProjectCollaboratorUncheckedUpdateManyInputSchema ]),
  where: ProjectCollaboratorWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const ProjectCollaboratorDeleteManyArgsSchema: z.ZodType<Prisma.ProjectCollaboratorDeleteManyArgs> = z.object({
  where: ProjectCollaboratorWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const ProjectStarCreateArgsSchema: z.ZodType<Prisma.ProjectStarCreateArgs> = z.object({
  select: ProjectStarSelectSchema.optional(),
  include: ProjectStarIncludeSchema.optional(),
  data: z.union([ ProjectStarCreateInputSchema,ProjectStarUncheckedCreateInputSchema ]),
}).strict() ;

export const ProjectStarUpsertArgsSchema: z.ZodType<Prisma.ProjectStarUpsertArgs> = z.object({
  select: ProjectStarSelectSchema.optional(),
  include: ProjectStarIncludeSchema.optional(),
  where: ProjectStarWhereUniqueInputSchema,
  create: z.union([ ProjectStarCreateInputSchema,ProjectStarUncheckedCreateInputSchema ]),
  update: z.union([ ProjectStarUpdateInputSchema,ProjectStarUncheckedUpdateInputSchema ]),
}).strict() ;

export const ProjectStarCreateManyArgsSchema: z.ZodType<Prisma.ProjectStarCreateManyArgs> = z.object({
  data: z.union([ ProjectStarCreateManyInputSchema,ProjectStarCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ProjectStarCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ProjectStarCreateManyAndReturnArgs> = z.object({
  data: z.union([ ProjectStarCreateManyInputSchema,ProjectStarCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ProjectStarDeleteArgsSchema: z.ZodType<Prisma.ProjectStarDeleteArgs> = z.object({
  select: ProjectStarSelectSchema.optional(),
  include: ProjectStarIncludeSchema.optional(),
  where: ProjectStarWhereUniqueInputSchema,
}).strict() ;

export const ProjectStarUpdateArgsSchema: z.ZodType<Prisma.ProjectStarUpdateArgs> = z.object({
  select: ProjectStarSelectSchema.optional(),
  include: ProjectStarIncludeSchema.optional(),
  data: z.union([ ProjectStarUpdateInputSchema,ProjectStarUncheckedUpdateInputSchema ]),
  where: ProjectStarWhereUniqueInputSchema,
}).strict() ;

export const ProjectStarUpdateManyArgsSchema: z.ZodType<Prisma.ProjectStarUpdateManyArgs> = z.object({
  data: z.union([ ProjectStarUpdateManyMutationInputSchema,ProjectStarUncheckedUpdateManyInputSchema ]),
  where: ProjectStarWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const ProjectStarUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ProjectStarUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ProjectStarUpdateManyMutationInputSchema,ProjectStarUncheckedUpdateManyInputSchema ]),
  where: ProjectStarWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const ProjectStarDeleteManyArgsSchema: z.ZodType<Prisma.ProjectStarDeleteManyArgs> = z.object({
  where: ProjectStarWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const CommentCreateArgsSchema: z.ZodType<Prisma.CommentCreateArgs> = z.object({
  select: CommentSelectSchema.optional(),
  include: CommentIncludeSchema.optional(),
  data: z.union([ CommentCreateInputSchema,CommentUncheckedCreateInputSchema ]),
}).strict() ;

export const CommentUpsertArgsSchema: z.ZodType<Prisma.CommentUpsertArgs> = z.object({
  select: CommentSelectSchema.optional(),
  include: CommentIncludeSchema.optional(),
  where: CommentWhereUniqueInputSchema,
  create: z.union([ CommentCreateInputSchema,CommentUncheckedCreateInputSchema ]),
  update: z.union([ CommentUpdateInputSchema,CommentUncheckedUpdateInputSchema ]),
}).strict() ;

export const CommentCreateManyArgsSchema: z.ZodType<Prisma.CommentCreateManyArgs> = z.object({
  data: z.union([ CommentCreateManyInputSchema,CommentCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const CommentCreateManyAndReturnArgsSchema: z.ZodType<Prisma.CommentCreateManyAndReturnArgs> = z.object({
  data: z.union([ CommentCreateManyInputSchema,CommentCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const CommentDeleteArgsSchema: z.ZodType<Prisma.CommentDeleteArgs> = z.object({
  select: CommentSelectSchema.optional(),
  include: CommentIncludeSchema.optional(),
  where: CommentWhereUniqueInputSchema,
}).strict() ;

export const CommentUpdateArgsSchema: z.ZodType<Prisma.CommentUpdateArgs> = z.object({
  select: CommentSelectSchema.optional(),
  include: CommentIncludeSchema.optional(),
  data: z.union([ CommentUpdateInputSchema,CommentUncheckedUpdateInputSchema ]),
  where: CommentWhereUniqueInputSchema,
}).strict() ;

export const CommentUpdateManyArgsSchema: z.ZodType<Prisma.CommentUpdateManyArgs> = z.object({
  data: z.union([ CommentUpdateManyMutationInputSchema,CommentUncheckedUpdateManyInputSchema ]),
  where: CommentWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const CommentUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.CommentUpdateManyAndReturnArgs> = z.object({
  data: z.union([ CommentUpdateManyMutationInputSchema,CommentUncheckedUpdateManyInputSchema ]),
  where: CommentWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const CommentDeleteManyArgsSchema: z.ZodType<Prisma.CommentDeleteManyArgs> = z.object({
  where: CommentWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const FacultyAssignmentCreateArgsSchema: z.ZodType<Prisma.FacultyAssignmentCreateArgs> = z.object({
  select: FacultyAssignmentSelectSchema.optional(),
  include: FacultyAssignmentIncludeSchema.optional(),
  data: z.union([ FacultyAssignmentCreateInputSchema,FacultyAssignmentUncheckedCreateInputSchema ]),
}).strict() ;

export const FacultyAssignmentUpsertArgsSchema: z.ZodType<Prisma.FacultyAssignmentUpsertArgs> = z.object({
  select: FacultyAssignmentSelectSchema.optional(),
  include: FacultyAssignmentIncludeSchema.optional(),
  where: FacultyAssignmentWhereUniqueInputSchema,
  create: z.union([ FacultyAssignmentCreateInputSchema,FacultyAssignmentUncheckedCreateInputSchema ]),
  update: z.union([ FacultyAssignmentUpdateInputSchema,FacultyAssignmentUncheckedUpdateInputSchema ]),
}).strict() ;

export const FacultyAssignmentCreateManyArgsSchema: z.ZodType<Prisma.FacultyAssignmentCreateManyArgs> = z.object({
  data: z.union([ FacultyAssignmentCreateManyInputSchema,FacultyAssignmentCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const FacultyAssignmentCreateManyAndReturnArgsSchema: z.ZodType<Prisma.FacultyAssignmentCreateManyAndReturnArgs> = z.object({
  data: z.union([ FacultyAssignmentCreateManyInputSchema,FacultyAssignmentCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const FacultyAssignmentDeleteArgsSchema: z.ZodType<Prisma.FacultyAssignmentDeleteArgs> = z.object({
  select: FacultyAssignmentSelectSchema.optional(),
  include: FacultyAssignmentIncludeSchema.optional(),
  where: FacultyAssignmentWhereUniqueInputSchema,
}).strict() ;

export const FacultyAssignmentUpdateArgsSchema: z.ZodType<Prisma.FacultyAssignmentUpdateArgs> = z.object({
  select: FacultyAssignmentSelectSchema.optional(),
  include: FacultyAssignmentIncludeSchema.optional(),
  data: z.union([ FacultyAssignmentUpdateInputSchema,FacultyAssignmentUncheckedUpdateInputSchema ]),
  where: FacultyAssignmentWhereUniqueInputSchema,
}).strict() ;

export const FacultyAssignmentUpdateManyArgsSchema: z.ZodType<Prisma.FacultyAssignmentUpdateManyArgs> = z.object({
  data: z.union([ FacultyAssignmentUpdateManyMutationInputSchema,FacultyAssignmentUncheckedUpdateManyInputSchema ]),
  where: FacultyAssignmentWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const FacultyAssignmentUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.FacultyAssignmentUpdateManyAndReturnArgs> = z.object({
  data: z.union([ FacultyAssignmentUpdateManyMutationInputSchema,FacultyAssignmentUncheckedUpdateManyInputSchema ]),
  where: FacultyAssignmentWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const FacultyAssignmentDeleteManyArgsSchema: z.ZodType<Prisma.FacultyAssignmentDeleteManyArgs> = z.object({
  where: FacultyAssignmentWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const ProjectFileCreateArgsSchema: z.ZodType<Prisma.ProjectFileCreateArgs> = z.object({
  select: ProjectFileSelectSchema.optional(),
  include: ProjectFileIncludeSchema.optional(),
  data: z.union([ ProjectFileCreateInputSchema,ProjectFileUncheckedCreateInputSchema ]),
}).strict() ;

export const ProjectFileUpsertArgsSchema: z.ZodType<Prisma.ProjectFileUpsertArgs> = z.object({
  select: ProjectFileSelectSchema.optional(),
  include: ProjectFileIncludeSchema.optional(),
  where: ProjectFileWhereUniqueInputSchema,
  create: z.union([ ProjectFileCreateInputSchema,ProjectFileUncheckedCreateInputSchema ]),
  update: z.union([ ProjectFileUpdateInputSchema,ProjectFileUncheckedUpdateInputSchema ]),
}).strict() ;

export const ProjectFileCreateManyArgsSchema: z.ZodType<Prisma.ProjectFileCreateManyArgs> = z.object({
  data: z.union([ ProjectFileCreateManyInputSchema,ProjectFileCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ProjectFileCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ProjectFileCreateManyAndReturnArgs> = z.object({
  data: z.union([ ProjectFileCreateManyInputSchema,ProjectFileCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ProjectFileDeleteArgsSchema: z.ZodType<Prisma.ProjectFileDeleteArgs> = z.object({
  select: ProjectFileSelectSchema.optional(),
  include: ProjectFileIncludeSchema.optional(),
  where: ProjectFileWhereUniqueInputSchema,
}).strict() ;

export const ProjectFileUpdateArgsSchema: z.ZodType<Prisma.ProjectFileUpdateArgs> = z.object({
  select: ProjectFileSelectSchema.optional(),
  include: ProjectFileIncludeSchema.optional(),
  data: z.union([ ProjectFileUpdateInputSchema,ProjectFileUncheckedUpdateInputSchema ]),
  where: ProjectFileWhereUniqueInputSchema,
}).strict() ;

export const ProjectFileUpdateManyArgsSchema: z.ZodType<Prisma.ProjectFileUpdateManyArgs> = z.object({
  data: z.union([ ProjectFileUpdateManyMutationInputSchema,ProjectFileUncheckedUpdateManyInputSchema ]),
  where: ProjectFileWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const ProjectFileUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ProjectFileUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ProjectFileUpdateManyMutationInputSchema,ProjectFileUncheckedUpdateManyInputSchema ]),
  where: ProjectFileWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const ProjectFileDeleteManyArgsSchema: z.ZodType<Prisma.ProjectFileDeleteManyArgs> = z.object({
  where: ProjectFileWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;