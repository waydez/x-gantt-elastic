import { pinyin, match } from 'pinyin-pro'
const getPinyin = function (zh) {
  return pinyin(zh, { toneType: 'none', nonZh: 'consecutive', v: true })
}

const judgeMatch = function (zh, pinyin) {
  return !!match(zh, pinyin)
}

export { getPinyin, judgeMatch }
export default { getPinyin, judgeMatch }
