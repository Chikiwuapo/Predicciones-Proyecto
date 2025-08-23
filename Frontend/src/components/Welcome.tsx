type Props = {
  user?: { name?: string }
  onLogout: () => void
}

const Welcome = ({ user, onLogout }: Props) => {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>BIENVENIDO!!!</h1>
      {user?.name && <h2 style={{ marginBottom: '1.5rem' }}>{user.name}</h2>}
      <button onClick={onLogout}>Salir</button>
    </div>
  )
}

export default Welcome
