# Role Scope In SEHC ECEP

## Scope model

The platform should use a simple scope model:

- `super_admin`: global access across all parts
- `partleader`: part-scoped management
- `employee`: self-service access only

## Business meaning

For SEHC, `partleader` should manage only their own part.

That means a `partleader` should only manage:

- employees belonging to their own part
- exams created within their own part
- certification operations for employees in that same part

In the current schema, `users.department` is being used as the part identifier.

## Data implications

To support this scope correctly:

1. `users.department` identifies the part a user belongs to
2. `exams.created_by_user_id` identifies who created the exam
3. exam ownership and employee management should be filtered by the authenticated user's part

## Access rules

### `super_admin`

Must be able to:

- manage all employees
- manage all exams
- view all results
- issue or revoke certificates across all parts

### `partleader`

Must be able to:

- manage employees in their own part only
- create and manage exams for their own part
- view exam results for employees in their own part
- issue certificates for employees in their own part

Must not be able to:

- manage employees from other parts
- edit exams owned by another part
- issue certificates outside their own part

### `employee`

Must only be able to:

- view their own profile
- take assigned exams
- view their own certification and exam history

## Implementation note

For backend authorization, the practical rule is:

- global roles bypass part filtering
- part-scoped roles must match `authUser.department === target.department`

That rule should be applied consistently in:

- employee listing
- employee detail
- exam creation and editing
- exam result listing
- certificate issuing
