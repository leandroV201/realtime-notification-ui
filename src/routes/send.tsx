import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAllUsers } from '@/services/users.service'
import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import { UserResponse } from '@/types/users'
import { Users } from '@/components/notifications/SendUsersList'
import { sendNotification } from '@/services/events.service'
import { send } from '@/types/send'
import { toast } from 'sonner'
import { uploadImage } from '@/services/upload.service'
import { useAuthStore } from '@/stores/auth.store'

export const Route = createFileRoute('/send')({
  component: SendPage,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      throw redirect({
        to: '/auth',
      })
    }
  },
})

export function SendPage() {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [notifyData, setNotifyData] = useState<send>({
    userId: '',
    type: 'info',
    title: '',
    message: '',
    data: {
      timestamp: new Date().toISOString(),
      url: ''
    },
  })

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()

    if (!notifyData.userId) {
      toast.error('Selecione um usuário')
      return
    }

    setIsLoading(true)

    try {
      let imageUrl: string | undefined

      if (selectedFile) {
        const uploadResponse = await uploadImage(selectedFile);
        notifyData.data.url = uploadResponse.url ?? ''
      }

      await sendNotification({
        ...notifyData
      })

      toast.success('Notificação enviada com sucesso 🚀')

      setSelectedFile(null)
      setNotifyData({
        userId: '',
        type: 'info',
        title: '',
        message: '',
        data: {
          timestamp: new Date().toISOString(),
          url: ''
        },
      })

    } catch (error) {
      console.error(error)
      toast.error('Erro ao enviar notificação')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getAllUsers().then(data => {
      setUsers(data.data)
    })
  }, [])

  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br p-4">
      <div className="w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Enviar notificação</CardTitle>
            <CardDescription>
              Envie uma nova notificação
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSend} className="flex flex-col gap-6">

              <div className="grid gap-2">
                <Label>Título</Label>
                <Input
                  value={notifyData.title}
                  onChange={(e) =>
                    setNotifyData(prev => ({
                      ...prev,
                      title: e.target.value
                    }))
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>Mensagem</Label>
                <Input
                  value={notifyData.message}
                  onChange={(e) =>
                    setNotifyData(prev => ({
                      ...prev,
                      message: e.target.value
                    }))
                  }
                  required
                />
              </div>

              {/* 🔥 Upload de imagem */}
              <div className="grid gap-2">
                <Label>Imagem (máx 1MB)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setSelectedFile(e.target.files[0])
                    }
                  }}
                />
              </div>

              <Field>
                <Select
                  value={notifyData.userId}
                  onValueChange={(value) =>
                    setNotifyData(prev => ({
                      ...prev,
                      userId: value
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    <Users users={users} />
                  </SelectContent>
                </Select>
              </Field>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Enviando...' : 'Enviar'}
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}