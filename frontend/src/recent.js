// 최근 본 상품: 서버 말고 이 브라우저(localStorage)에 저장한다
// 브라우저에 따라 저장이 막혀 있을 수 있어서 try/catch로 감싼다 (막혀 있으면 그냥 빈 목록)

const KEY = 'recentProducts'
const MAX = 10

export function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

// 상세를 볼 때 부른다: 같은 상품은 맨 앞으로 옮기고, 10개까지만
export function addRecent(product) {
  const item = { id: product.id, title: product.title, price: product.price, image_url: product.image_url }
  const list = [item, ...getRecent().filter((p) => p.id !== product.id)].slice(0, MAX)
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    // 저장이 막혀 있으면 넘어간다
  }
}

// 지워진 상품은 목록에서 뺀다
export function removeRecent(productId) {
  try {
    localStorage.setItem(KEY, JSON.stringify(getRecent().filter((p) => p.id !== productId)))
  } catch {
    // 넘어간다
  }
}
