import React, { memo, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAllUsers } from '@/services/users.service'
import { createFileRoute } from '@tanstack/react-router'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import { UserResponse } from '@/types/users'
import { Users } from '@/components/notifications/SendUsersList'

export const Route = createFileRoute('/send')({
  component: CardDemo,
});

function CardDemo() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [sendNotification, setSendNotification] = useState({
    id: '',
  })

  useEffect(() => {
    let cancelled = false;

    getAllUsers()
      .then(data => {
        if (!cancelled) {
          setUsers(data);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Enviar notificação</CardTitle>
            <CardDescription>
              Envie uma nova notificação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input id="password" type="password" required />
                </div>
                <div>
                  <Field>
                    <Select>
                      <SelectTrigger className="w-full max-w-48">
                        <SelectValue placeholder="Selecione Usuario" />
                      </SelectTrigger>
                      <SelectContent>
                        <Users users={users} />
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full">
              Login
            </Button>
            <Button variant="outline" className="w-full">
              Login with Google
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
