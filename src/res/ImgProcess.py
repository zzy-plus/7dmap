from PIL import Image, ImageDraw
import os
import json
import sys

colors = {
    '6': (0, 255, 255),
    '5': (148, 0, 211),
    '4': (255, 0, 0),
    '3': (255, 255, 0),
    '2': (0, 0, 255),
    '1': (0, 255, 50),
    '0': (156, 156, 156)
}
sizes = {
    '6': 51,
    '5': 41,
    '4': 37,
    '3': 33,
    '2': 29,
    '1': 25,
    '0': 21
}

if __name__ == '__main__':

    params = sys.argv
    #world_name = params[1]
    path = params[1]
    res_path = params[2]
    output_path = params[3]
    mapSize = int(params[4])

    # user_home_dir = os.path.expanduser("~")
    # spath = r'\AppData\Roaming\7DaysToDie\GeneratedWorlds'
    # path = user_home_dir + spath + '\\' + world_name + '\\'

    # 叠加图片
    img1 = Image.open(path + 'biomes.png')
    img2 = Image.open(path + 'splat3.png')
    legend = Image.open( res_path + 'legend.png')
    legend = legend.resize(img1.size)
    img = Image.alpha_composite(img1.convert("RGBA"), img2.convert("RGBA"))
    img = Image.alpha_composite(img, legend.convert('RGBA'))

    # 创建绘图对象
    draw = ImageDraw.Draw(img)
    with open(res_path + 'points.json', 'r', encoding='utf-8') as f:
        points = json.load(f)

    for point in points:
        color = colors[point['clazz']]
        size = sizes[point['clazz']]
        x = point['real_x'] + mapSize//2
        y = mapSize//2 - point['real_y']
        left_top = (x - size//2, y - size//2)
        right_bottom = (x + size//2, y + size//2)
        draw.rectangle((left_top, right_bottom), fill=color)

    # 保存
    img.save(output_path)

