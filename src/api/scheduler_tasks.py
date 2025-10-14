"""
Módulo para manejar tareas programadas automáticamente
Contiene todas las funciones de automatización y configuración del scheduler
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import logging
import os
import requests
import pytz

class MembershipScheduler:
    """Clase para manejar el scheduler de membresías"""
    
    def __init__(self, app=None):
        self.app = app
        self.scheduler = None
        
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """Inicializar el scheduler con la aplicación Flask"""
        self.app = app
        self.setup_logging()
        
    def setup_logging(self):
        """Configurar logging para el scheduler"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        logging.getLogger('apscheduler').setLevel(logging.INFO)
  
    def keep_service_alive(self):
        """Mantener el servicio despierto solo en producción (Render)"""
        
        # ✅ Solo ejecutar en producción (Render)
        if os.getenv('RENDER') != 'true':
            print("[KEEP-ALIVE] Skipping - No está en Render")
            return
        
        try:
            # ✅ Usar variable de entorno para la URL
            service_url = os.getenv('BACKEND_URL')
            health_endpoint = f"{service_url}/api/health"
            
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            response = requests.get(
                health_endpoint,
                timeout=30,
                headers={
                    'User-Agent': 'KeepAlive-Internal',
                    'X-Keep-Alive': 'true'
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"[KEEP-ALIVE] {current_time} - ✓ {data.get('status', 'OK')}")
            else:
                print(f"[KEEP-ALIVE] {current_time} - Status: {response.status_code}")
                
        except Exception as e:
            print(f"[KEEP-ALIVE] {current_time} - Error: {str(e)[:100]}")
            

    def create_scheduler(self):
        """Crear y configurar el scheduler con todas las tareas programadas"""
        self.scheduler = BackgroundScheduler()
        
        # Zona horaria de Caracas, Venezuela (UTC-4)
        timezone = pytz.timezone('America/Caracas')



        # ✅ NUEVA TAREA: Keep-alive para Render.com cada 10 minutos
        self.scheduler.add_job(
            func=self.keep_service_alive,
            # trigger=IntervalTrigger(seconds=30),
            trigger=IntervalTrigger(minutes=11),
            id='keep_alive_render',
            name='Keep Alive - Render Service',
            replace_existing=True
        )

        return self.scheduler
    
    def start_scheduler(self):
        """Iniciar el scheduler con todas las tareas programadas"""
        if not self.scheduler:
            self.scheduler = self.create_scheduler()
        
        try:
            self.scheduler.start()
            
            # Mostrar información de tareas programadas
            print("\n" + "="*60)
            print("🚀 [SCHEDULER] Tareas automáticas iniciadas exitosamente")
            print("="*60)
            
            jobs = self.scheduler.get_jobs()
            for job in jobs:
                next_run = job.next_run_time.strftime('%Y-%m-%d %H:%M:%S') if job.next_run_time else 'No programado'
                print(f"📅 {job.name}")
                print(f"   ⏰ Próxima ejecución: {next_run}")
                print(f"   🆔 ID: {job.id}")
                print()
            
            self.app.logger.info("Scheduler iniciado con todas las tareas programadas")
            return True
            
        except Exception as e:
            error_msg = f"Error al iniciar scheduler: {str(e)}"
            self.app.logger.error(error_msg)
            print(f"❌ [SCHEDULER ERROR] {error_msg}")
            return False
    
    def stop_scheduler(self):
        """Detener el scheduler de forma segura"""
        if self.scheduler and self.scheduler.running:
            self.scheduler.shutdown()
            print("🛑 [SCHEDULER] Scheduler detenido correctamente")
            self.app.logger.info("Scheduler detenido correctamente")
    
    def get_scheduler_status(self):
        """Obtener el estado actual del scheduler y sus tareas"""
        if not self.scheduler:
            return {"status": "not_initialized", "jobs": []}
        
        status = {
            "status": "running" if self.scheduler.running else "stopped",
            "jobs": []
        }
        
        for job in self.scheduler.get_jobs():
            job_info = {
                "id": job.id,
                "name": job.name,
                "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
                "trigger": str(job.trigger)
            }
            status["jobs"].append(job_info)
        
        return status
    
    def run_maintenance_now(self):
        """Ejecutar mantenimiento inmediatamente (para testing o uso manual)"""
        print("🔧 [MANUAL] Ejecutando mantenimiento manual...")
        return self.automated_membership_maintenance()


# Instancia global del scheduler (se inicializa desde app.py)
membership_scheduler = MembershipScheduler()

# Función de conveniencia para usar desde otros módulos
def get_scheduler_status():
    """Función de conveniencia para obtener el estado del scheduler"""
    return membership_scheduler.get_scheduler_status()

def run_manual_maintenance():
    """Función de conveniencia para ejecutar mantenimiento manual"""
    return membership_scheduler.run_maintenance_now()

