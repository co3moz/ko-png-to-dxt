Knight Online PNG2DXT Converter
==============================
This application will transform your png files to texture files (.dxt)

![](doc/a1r5g5b5.png)

Install
----------------
* install node.js
* type in terminal `npm i ko-png-to-dxt -g`

Usage
-----------------
* type in terminal `png2dxt file.png`
* there will be `file.dxt`


Tips
----------------

You may change the output with `-o` or `--output`

```sh
png2dxt -o ./test.dxt file.png
```

You can convert all .png files in cwd by using `-d` or `--directory`

```sh
cd ./some_folder_has_tons_of_pngs
png2dxt -d
```
with output directory

```sh
cd ./some_folder_has_tons_of_pngs
png2dxt -d -o ./png
```

It will only work with cwd, I thought this will be safer, and .dxts wont be replicated if they already exist

Dxt Format
----------------

You may change the format of output file. Supported output formats;

* dxt1
* dxt3
* dxt5
* a8r8g8b8
* x8r8g8b8
* a4r4b4g4
* a1r5g5b5

```sh
png2dxt -f dxt5 file.png
```