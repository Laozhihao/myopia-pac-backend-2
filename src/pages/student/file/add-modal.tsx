import { Modal, Spin, Button } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { FileCardPropsParams } from './index';
import { modalConfig } from '@/hook/ant-config';

export const AddModal: React.FC<API.ModalItemType & FileCardPropsParams> = (props) => {
  const [loading, setLoading] = useState(false);
  const [iframeSrc, setIframeSrc] = useState(''); // iframe 嵌套页
  const [currentHostPath, setCurrentHostPath] = useState(''); // 域名

  // 获取当前域名
  useMemo(() => {
    const { protocol, host } = location;
    const hostPath = `${protocol}//${host.replace(/school/, 'report')}`;
    setCurrentHostPath(hostPath);
  }, []);

  useEffect(() => {
    if (props.visible) {
      setLoading(true);
      setIframeSrc(
        `${currentHostPath}?resultId=${props.resultId}&templateId=${props.templateId}&crossStatus=true`,
      );
    }
  }, [props.visible]);

  // Iframe加载完成
  const loadHandler = () => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // 生成PDF
  const onPdf = () => {
    const a = document.getElementById('cardIframe');
    if (!a) {
      return;
    }
    setLoading(true);
    // 跨域通知PDF项目生成PDF文件，再window.open打开
    a.contentWindow.postMessage('打印', currentHostPath);
    // 接收到生成PDF回调，loading消失
    function receiveMessage() {
      setLoading(false);
    }
    window.addEventListener('message', receiveMessage, false);
  };

  return (
    <Modal
      title={props.title}
      visible={props.visible}
      onCancel={() => props.onCancel()}
      width={810}
      footer={null}
      {...modalConfig}
    >
      <Spin spinning={loading}>
        <Button type="primary" onClick={onPdf} style={{ marginBottom: 20 }}>
          生成PDF
        </Button>
        <div id="fileCardPrintElement">
          <iframe
            style={{ border: 0 }}
            id="cardIframe"
            title="cardIframe"
            width="760"
            height="1073"
            scrolling="no"
            src={iframeSrc}
            onLoad={loadHandler}
          />
        </div>
      </Spin>
    </Modal>
  );
};
