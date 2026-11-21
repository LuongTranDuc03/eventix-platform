-- KEYS[1]: Redis Key của kho vé (Ví dụ: "zone:stock:1")
-- ARGV[1]: Số lượng vé muốn mua (Ví dụ: 2)

local stockKey = KEYS[1]
local rawArg = ARGV[1]
if type(rawArg) == "string" then
    rawArg = string.gsub(rawArg, '"', '')
end
local requestedQty = tonumber(rawArg)

-- Lấy số lượng vé hiện tại trên Redis
local currentStock = redis.call('get', stockKey)

if not currentStock then
    return -1 -- Lỗi: Không tìm thấy Zone
end

-- Loại bỏ dấu ngoặc kép JSON nếu có (do GenericJackson2JsonRedisSerializer thêm vào)
if type(currentStock) == "string" then
    currentStock = string.gsub(currentStock, '"', '')
end
currentStock = tonumber(currentStock)

if not currentStock or not requestedQty then
    return -1
end

-- Kiểm tra xem còn đủ vé không
if currentStock >= requestedQty then
    -- Đủ vé -> Trừ kho và trả về số lượng vé còn lại
    local newStock = currentStock - requestedQty
    redis.call('set', stockKey, tostring(newStock))
    return newStock
else
    -- Không đủ vé
    return -2 -- Lỗi: Hết vé (Sold out)
end