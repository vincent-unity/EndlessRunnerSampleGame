
- [ ] Unity 2019 package WEBGL without "Development" checked

- [ ] In PlayerSettings -> Publish Settings:  select **Disabled** compression method

- [ ] In PlayerSettings -> Publish Settings:  deselect all options you can see

- [ ] In PlayerSettings -> Resolution ... : Select **Minimal** Template

- [ ] * Build Project, and copy files from ${ProjectName}/Build/ to /Build/
     >Jump this step, if you add -s param when *Generate WeChat Project*

- [ ] install python3 and execute 
      ```
      pip install brotli
      ```

- [ ] Generate WeChat Project 
        ```
        python WebGL2WeChat.py -f ProjectName(Must) -a WechatAppId(Optional) -c cdnURL(Optional)
        ```