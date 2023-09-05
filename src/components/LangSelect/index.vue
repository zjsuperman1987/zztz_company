<template>
  <el-dropdown
    trigger="hover"
    class="international"
    @command="handleSetLanguage"
  >
    <div>{{ $t("home.lang") }}<i class="el-icon-caret-bottom" /></div>
    <el-dropdown-menu slot="dropdown" class="language-dropdown">
      <el-dropdown-item :disabled="language === 'zh'" command="zh">
        中文
      </el-dropdown-item>
      <el-dropdown-item :disabled="language === 'en'" command="en">
        English
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  computed: {
    language() {
      return this.$store.getters.language;
    },
  },
  methods: {
    handleSetLanguage(lang) {
      this.$i18n.locale = lang;
      this.$store.dispatch("language/setLanguage", lang);
    },
  },
};
</script>
