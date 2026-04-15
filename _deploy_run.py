import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

HOST = "187.127.8.253"
USER = "dev"
PASS = "passworddev08060402!"

COMMANDS = [
    ("Baixando codigo novo...",     "cd /srv/doafacil && git pull origin master"),
    ("Buildando backend...",        "cd /srv/doafacil/backend && npm run build 2>&1 | tail -5"),
    ("Regenerando Prisma client...", "cd /srv/doafacil/backend && npx prisma generate 2>&1 | tail -3"),
    ("Reiniciando backend...",      "pm2 restart doafacil-backend"),
    ("Buildando frontend...",       "cd /srv/doafacil && npm run build 2>&1 | tail -8"),
    ("Reiniciando frontend...",     "pm2 restart doafacil-frontend"),
    ("Status final:",               "pm2 status"),
]

print("\n=== DEPLOY humanitybearers.tech ===\n")

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(HOST, username=USER, password=PASS,
                   timeout=20, look_for_keys=False, allow_agent=False)
    print("Conectado ao servidor!\n")
except Exception as e:
    print(f"Erro ao conectar: {e}")
    input("\nPressione Enter para fechar...")
    sys.exit(1)

ok = True
for label, cmd in COMMANDS:
    print(f"--- {label}")
    try:
        _, stdout, stderr = client.exec_command(cmd, timeout=300)
        out = stdout.read().decode("utf-8", errors="replace").strip()
        err = stderr.read().decode("utf-8", errors="replace").strip()
        if out:
            print(out)
        if err and "npm warn" not in err.lower():
            print("[aviso]", err[:300])
    except Exception as e:
        print(f"Erro: {e}")
        ok = False
    print()

client.close()

if ok:
    print("=== DEPLOY CONCLUIDO COM SUCESSO! ===")
else:
    print("=== DEPLOY FINALIZADO COM AVISOS ===")

input("\nPressione Enter para fechar...")
