-- 更新现有作品的图片路径，将所有图片移动到插画分类文件夹
UPDATE works 
SET image_url = REPLACE(image_url, '/images/', '/images/插画/')
WHERE image_url LIKE '/images/%' AND image_url NOT LIKE '/images/插画/%';