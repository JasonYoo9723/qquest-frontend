<!-- src/views/LoginPage.vue -->
<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

function onGoogleLoginSuccess(response: any) {
  const profile = response.getBasicProfile()
  const idToken = response.getAuthResponse().id_token

  userStore.setToken(idToken)
  userStore.setUser({
    email: profile.getEmail(),
    name: profile.getName(),
    picture: profile.getImageUrl(),
    sub: profile.getId(),
  })

  router.push('/') // 로그인 후 홈으로 이동
}
</script>
