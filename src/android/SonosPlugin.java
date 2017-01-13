package cordova.plugin.sonos;
import java.io.IOException;
import java.net.DatagramPacket;
import java.net.InetAddress;
import java.net.MulticastSocket;
import java.util.HashMap;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import cordova.plugin.sonos.SonosPlugin.*;

import org.apache.cordova.LOG;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * This class echoes a string called from JavaScript.
 */
public class SonosPlugin extends CordovaPlugin {
    
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("coolMethod")) {
            String message = args.getString(0);
            this.coolMethod(message, callbackContext);
            return true;
        }else if (action.equals("foundSonos")){
            this.foundSonos(callbackContext);
        }
        return false;
    }
    
    private void coolMethod(String message, CallbackContext callbackContext) {
        if (message != null && message.length() > 0) {
            callbackContext.success(message);
        } else {
            callbackContext.error("Expected one non-empty string argument.");
        }
    }
    private void foundSonos(CallbackContext callbackContext){
        SonosPlugin.DiscoverCordova d = new SonosPlugin.DiscoverCordova();
        
        try {
            Thread.sleep(1000);
        } catch (InterruptedException x) {
        }
        d.done();
        String[] list = d.getList();
        
        JSONArray j = new JSONArray();
        
        for (int n = 0; n < list.length; n++) {
            j.put(list[n]);
        };
        
        if (j.length()>-1) {
            callbackContext.success(j);
        }else{
            callbackContext.error("Not found devise");
        }
        
    }
    
    public static class DiscoverCordova extends Thread {
        static final int SSDP_PORT = 1900;
        static final String SSDP_ADDR = "239.255.255.250";
        
        static String query =
        "M-SEARCH * HTTP/1.1\r\n"+
        "HOST: 239.255.255.250:1400\r\n"+
        "MAN: \"ssdp:discover\"\r\n"+
        "MX: 1\r\n"+
        "ST: urn:schemas-upnp-org:service:AVTransport:1\r\n"+
        //"ST: ssdp:all\r\n"+
        "\r\n";
        
        InetAddress addr;
        MulticastSocket s;
        Pattern pLocation;
        volatile boolean active;
        Listener callback;
        Object lock;
        HashMap<String,String> list;
        
        void send_query() throws IOException {
            DatagramPacket p;
            p = new DatagramPacket(
                                   query.getBytes(),query.length(),
                                   addr,SSDP_PORT);
            s.send(p);
            s.send(p);
            s.send(p);
        }
        void handle_notify(DatagramPacket p) throws IOException {
            s.receive(p);
            String s = new String(p.getData(), 0, p.getLength());
            Matcher m = pLocation.matcher(s);
            if (m.find(0)) {
                boolean notify = false;
                String a = m.group(1);
                synchronized (lock) {
                    if (!list.containsKey(a)) {
                        list.put(a,a);
                        notify = true;
                    }
                }
                if (notify && (callback != null))
                    callback.found(a);
            }
        }
        public String[] getList() {
            synchronized (lock) {
                Set<String> set = list.keySet();
                String[] out = new String[set.size()];
                int n = 0;
                for (String s : set)
                    out[n++] = s;
                return out;
            }
        }
        public void run() {
            
            DatagramPacket p =
            new DatagramPacket(new byte[1540], 1540);
            list = new HashMap<String,String>();
            lock = new Object();
            try {
                addr = InetAddress.getByName(SSDP_ADDR);
                s = new MulticastSocket(SSDP_PORT);
                s.joinGroup(addr);
                send_query();
            } catch (IOException x) {
                System.err.println("cannot create socket");
            }
            while (active) {
                try {
                    handle_notify(p);
                } catch (IOException x) {
                    /* done causes an exception when it closes the socket */
                    if (active)
                        System.err.println("io error");
                }
            }
        }
        public void done() {
            active = false;
            s.close();
        }
        public DiscoverCordova() {
            init(null);
        }
        public DiscoverCordova(Listener cb) {
            init(cb);
        }
        void init(Listener cb) {
            active = true;
            this.callback = cb;
            pLocation = Pattern.compile("^LOCATION:\\s*http://(.*):1400/xml/device_description.xml$",Pattern.MULTILINE | Pattern.CASE_INSENSITIVE);
            start();
        }
        public interface Listener {
            public void found(String host);
        }
    }
}


