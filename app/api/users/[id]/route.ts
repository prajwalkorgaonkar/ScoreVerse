import { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, requireAuth, ok, err } from '@/lib/api-helpers'

// GET /api/users/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { user, error: authError } = await requireAuth()
  if (authError) return authError

  // Users can only read their own profile unless admin
  if (user.id !== resolvedParams.id && user.role !== 'super_admin') {
    return err('Forbidden', 403)
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, avatar_url, created_at')
      .eq('id', resolvedParams.id)
      .single()

    if (error) return err('User not found', 404)
    return ok({ user: data })
  } catch (e: any) {
    return err(e.message, 500)
  }
}

// PATCH /api/users/[id]  — update profile
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { user, error: authError } = await requireAuth()
  if (authError) return authError

  // Users can update their own profile; admins can update any
  if (user.id !== resolvedParams.id && user.role !== 'super_admin') {
    return err('Forbidden', 403)
  }

  try {
    const body = await req.json()

    // Determine which fields can be updated
    const userUpdates: Record<string, any> = {}
    if (body.full_name) userUpdates.full_name = body.full_name.trim()
    if (body.avatar_url !== undefined) userUpdates.avatar_url = body.avatar_url
    if (body.is_approved !== undefined) {
      if (user.role !== 'super_admin') return err('Only Super Admin can change approval', 403)
      userUpdates.is_approved = body.is_approved
    }

    // Only super_admin can change roles
    if (body.role !== undefined) {
      if (user.role !== 'super_admin') return err('Only Super Admin can change roles', 403)
      if (!['super_admin', 'manager'].includes(body.role)) return err('Invalid role')
      if (user.id === resolvedParams.id) return err("You can't change your own role")
      userUpdates.role = body.role
      
      const adminClient = createAdminClient()
      await adminClient.auth.admin.updateUserById(resolvedParams.id, {
        user_metadata: { role: body.role }
      })
    }

    if (Object.keys(userUpdates).length === 0) return err('No valid fields to update')

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('profiles')
      .update(userUpdates)
      .eq('id', resolvedParams.id)
      .select('id, email, full_name, role, avatar_url, is_approved')
      .single()

    if (error) return err(error.message, 500)
    return ok({ user: data })
  } catch (e: any) {
    return err(e.message, 500)
  }
}

// DELETE /api/users/[id]  — Super Admin only
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { user, error: authError } = await requireAdmin()
  if (authError) return authError

  if (user.id === resolvedParams.id) return err("You can't delete yourself")

  try {
    const adminClient = createAdminClient()
    const { error } = await adminClient.auth.admin.deleteUser(resolvedParams.id)
    if (error) return err(error.message, 500)
    return ok({ message: 'User deleted' })
  } catch (e: any) {
    return err(e.message, 500)
  }
}
