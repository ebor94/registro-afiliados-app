<script setup>
defineProps({ visible: { type: Boolean, default: false } })
defineEmits(['close'])

const beneficios = [
  {
    icon: '🏥',
    titulo: 'Médica',
    descripcion: 'Orientación y asistencia médica para ti y tu familia donde estés.'
  },
  {
    icon: '👴',
    titulo: 'Tercera Edad',
    descripcion: 'Apoyo especializado para adultos mayores en situaciones de necesidad.'
  },
  {
    icon: '👤',
    titulo: 'Personal',
    descripcion: 'Asistencia personal en trámites, emergencias y situaciones del día a día.'
  },
  {
    icon: '🎓',
    titulo: 'Educativa',
    descripcion: 'Acceso a orientación y recursos educativos para toda la familia.'
  },
  {
    icon: '🐾',
    titulo: 'Mascotas',
    descripcion: 'Cuidado y orientación veterinaria para las mascotas del hogar.'
  },
  {
    icon: '📞',
    titulo: 'Telefónica Legal',
    descripcion: 'Asesoría jurídica telefónica disponible cuando más la necesitas.'
  }
]
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="$emit('close')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />

        <!-- Panel -->
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

          <!-- Header -->
          <div class="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 class="text-lg font-bold text-white">Asistencia fuera de casa</h2>
                <p class="text-sm text-teal-100 mt-1 leading-snug">
                  Extiende los beneficios de estar vinculado a un Plan Exequial con Los Olivos,
                  entregando a las familias protección, bienestar y la tranquilidad de contar
                  con nuestro apoyo en todo momento.
                </p>
              </div>
              <button
                @click="$emit('close')"
                class="text-teal-200 hover:text-white transition-colors flex-shrink-0 mt-0.5"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Beneficios -->
          <div class="px-6 py-5">
            <div class="grid grid-cols-3 gap-3">
              <div
                v-for="b in beneficios"
                :key="b.titulo"
                class="flex flex-col items-center text-center bg-teal-50 border border-teal-100 rounded-xl px-3 py-4 gap-2 hover:bg-teal-100 transition-colors"
              >
                <span class="text-3xl leading-none">{{ b.icon }}</span>
                <span class="text-xs font-bold text-teal-800 leading-tight">{{ b.titulo }}</span>
                <span class="text-xs text-teal-600 leading-tight hidden sm:block">{{ b.descripcion }}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 pb-5">
            <button
              @click="$emit('close')"
              class="w-full py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors"
            >
              Entendido
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
