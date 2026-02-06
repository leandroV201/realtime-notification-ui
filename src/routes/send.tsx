import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/send')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/send"!</div>
}
