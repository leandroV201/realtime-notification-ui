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
import { sendNotification } from '@/services/events.service'
import { send } from '@/types/send'
import { DialogClose } from '@/components/ui/dialog'

export const Route = createFileRoute('/send')({
  component: SendPage,
});

export function SendPage() {
  const timestamp = new Date().toISOString()
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [notifyData, setNotifyData] = useState<send>({
    userId: '',
    type: 'info',
    title: '',
    message: '',
    data: {
      timestamp,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = sendNotification(notifyData);
      console.log(response);
    } catch (e) {
      return e;
    }

  }

  useEffect(() => {
    let cancelled = false;

    getAllUsers()
      .then(data => {
        if (!cancelled) {
          setUsers(data.data);
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
    <div className="flex min-h-full  items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-7xl">
        <Card className="w-full ">
          <CardHeader>
            <CardTitle>Enviar notificação</CardTitle>
            <CardDescription>
              Envie uma nova notificação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Titulo</Label>
                  <Input
                    id="titulo"
                    type="titulo"
                    value={notifyData.title}
                    onChange={(e) => {
                      setNotifyData({ ...notifyData, title: e.target.value })
                    }}
                    placeholder="Titulo"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="message">Mensagem</Label>
                  </div>
                  <Input id="message" type="message" value={notifyData.message} onChange={(e) => {
                    setNotifyData({ ...notifyData, message: e.target.value })
                  }} required />
                </div>
                <div>
                  <Field>
                    <Select value={notifyData.userId} onValueChange={(value) =>
                      setNotifyData((prev) => ({ ...prev, userId: value }))
                    }>
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
              <DialogClose asChild>
                <Button type="submit" className="w-full mt-4">
                  Enviar
                </Button>
              </DialogClose>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
